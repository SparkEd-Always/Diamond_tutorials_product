"""
Push Notification Service using Expo Push API
Sends notifications to parents and teachers via Expo
"""
import requests
from typing import List, Dict
import json


class PushNotificationService:
    EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

    @staticmethod
    def send_notification(
        push_token: str,
        title: str,
        body: str,
        data: Dict = None
    ) -> Dict:
        """
        Send a push notification to a single device

        Args:
            push_token: Expo push token (ExponentPushToken[xxx])
            title: Notification title
            body: Notification message
            data: Optional data payload

        Returns:
            Response from Expo API
        """
        if not push_token or not push_token.startswith('ExponentPushToken'):
            print(f"❌ Invalid push token: {push_token}")
            return {"status": "error", "message": "Invalid push token"}

        payload = {
            "to": push_token,
            "title": title,
            "body": body,
            "sound": "default",
            "priority": "high",
            "channelId": "default",
        }

        if data:
            payload["data"] = data

        try:
            response = requests.post(
                PushNotificationService.EXPO_PUSH_URL,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                data=json.dumps(payload)
            )

            if response.status_code == 200:
                result = response.json()
                if result.get("data"):
                    ticket = result["data"][0]
                    if ticket.get("status") == "ok":
                        print(f"✅ Push notification sent to {push_token[:20]}...")
                        return {"status": "success", "ticket": ticket}
                    else:
                        print(f"❌ Expo error: {ticket.get('message')}")
                        return {"status": "error", "message": ticket.get("message")}

            print(f"❌ HTTP {response.status_code}: {response.text}")
            return {"status": "error", "message": f"HTTP {response.status_code}"}

        except Exception as e:
            print(f"❌ Push notification error: {str(e)}")
            return {"status": "error", "message": str(e)}

    @staticmethod
    def send_bulk_notifications(
        notifications: List[Dict]
    ) -> Dict:
        """
        Send multiple push notifications in a single request

        Args:
            notifications: List of notification dicts with keys:
                - push_token: Expo push token
                - title: Notification title
                - body: Notification message
                - data: Optional data payload

        Returns:
            Summary of sent notifications
        """
        messages = []
        for notif in notifications:
            push_token = notif.get("push_token")
            if not push_token or not push_token.startswith('ExponentPushToken'):
                continue

            message = {
                "to": push_token,
                "title": notif.get("title"),
                "body": notif.get("body"),
                "sound": "default",
                "priority": "high",
                "channelId": "default",
            }

            if notif.get("data"):
                message["data"] = notif["data"]

            messages.append(message)

        if not messages:
            return {"status": "error", "message": "No valid push tokens"}

        try:
            response = requests.post(
                PushNotificationService.EXPO_PUSH_URL,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                data=json.dumps(messages)
            )

            if response.status_code == 200:
                result = response.json()
                tickets = result.get("data", [])

                success_count = sum(1 for t in tickets if t.get("status") == "ok")
                error_count = len(tickets) - success_count

                print(f"✅ Sent {success_count} notifications, {error_count} failed")

                return {
                    "status": "success",
                    "sent": success_count,
                    "failed": error_count,
                    "tickets": tickets
                }

            return {"status": "error", "message": f"HTTP {response.status_code}"}

        except Exception as e:
            print(f"❌ Bulk push notification error: {str(e)}")
            return {"status": "error", "message": str(e)}

    @staticmethod
    async def send_message_notification(
        push_token: str,
        sender_name: str,
        message_preview: str,
        message_id: int
    ):
        """Send notification for a new message"""
        return PushNotificationService.send_notification(
            push_token=push_token,
            title=f"New message from {sender_name}",
            body=message_preview,
            data={
                "type": "message",
                "messageId": message_id,
                "action": "open_messages"
            }
        )

    @staticmethod
    async def send_attendance_notification(
        push_token: str,
        student_name: str,
        status: str,
        date: str
    ):
        """Send notification for attendance update"""
        status_emoji = "✅" if status == "present" else "❌"
        return PushNotificationService.send_notification(
            push_token=push_token,
            title=f"{status_emoji} Attendance Update",
            body=f"{student_name} marked {status} on {date}",
            data={
                "type": "attendance",
                "status": status,
                "date": date,
                "action": "open_attendance"
            }
        )

    @staticmethod
    async def send_announcement_notification(
        push_tokens: List[str],
        title: str,
        message: str,
        announcement_id: int
    ):
        """Send bulk announcement notifications"""
        notifications = [
            {
                "push_token": token,
                "title": title,
                "body": message[:100] + "..." if len(message) > 100 else message,
                "data": {
                    "type": "announcement",
                    "announcementId": announcement_id,
                    "action": "open_announcements"
                }
            }
            for token in push_tokens
        ]

        return PushNotificationService.send_bulk_notifications(notifications)
