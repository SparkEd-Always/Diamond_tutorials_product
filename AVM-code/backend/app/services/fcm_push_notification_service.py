"""
Firebase Cloud Messaging (FCM) v1 API Push Notification Service
Uses Firebase Admin SDK for secure, OAuth2-based push notifications
"""
import firebase_admin
from firebase_admin import credentials, messaging
from typing import List, Dict, Optional
import os
import json


class FCMPushNotificationService:
    """Firebase Cloud Messaging service using modern v1 API"""

    _initialized = False

    @classmethod
    def initialize(cls):
        """Initialize Firebase Admin SDK with service account credentials"""
        if cls._initialized:
            return

        try:
            # Try to load from environment variable first (for Railway deployment)
            firebase_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')

            if firebase_json:
                # Load credentials from environment variable JSON string
                print("🔑 Loading Firebase credentials from environment variable...")
                cred_dict = json.loads(firebase_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                cls._initialized = True
                print("✅ Firebase Admin SDK initialized successfully (from env var)")
                return

            # Fall back to file-based credentials (for local development)
            cred_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                'firebase-service-account.json'
            )

            if os.path.exists(cred_path):
                print(f"🔑 Loading Firebase credentials from file: {cred_path}")
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                cls._initialized = True
                print("✅ Firebase Admin SDK initialized successfully (from file)")
                return

            # No credentials found
            print("❌ Firebase service account not found!")
            print("   - Not found in environment variable: FIREBASE_SERVICE_ACCOUNT_JSON")
            print(f"   - Not found in file: {cred_path}")
            print("   - Push notifications will NOT work until credentials are provided")

        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {str(e)}")
        except Exception as e:
            print(f"❌ Failed to initialize Firebase Admin SDK: {str(e)}")

    @staticmethod
    def send_notification(
        fcm_token: str,
        title: str,
        body: str,
        data: Optional[Dict] = None
    ) -> Dict:
        """
        Send a push notification to a single device using FCM v1 API

        Args:
            fcm_token: Firebase Cloud Messaging token
            title: Notification title
            body: Notification message
            data: Optional data payload

        Returns:
            Response dict with status and message ID
        """
        # Initialize if not already done
        FCMPushNotificationService.initialize()

        if not FCMPushNotificationService._initialized:
            return {"status": "error", "message": "Firebase not initialized"}

        if not fcm_token:
            print("❌ No FCM token provided")
            return {"status": "error", "message": "No FCM token"}

        try:
            # Build the message
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                android=messaging.AndroidConfig(
                    priority='high',
                    notification=messaging.AndroidNotification(
                        channel_id='default',
                        sound='default',
                        priority='high',
                        default_vibrate_timings=True,
                        default_light_settings=True,
                    ),
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            alert=messaging.ApsAlert(
                                title=title,
                                body=body,
                            ),
                            sound='default',
                            badge=1,
                        ),
                    ),
                ),
                token=fcm_token,
            )

            # Send the message
            response = messaging.send(message)

            print(f"✅ FCM notification sent successfully: {response}")
            return {
                "status": "success",
                "message_id": response,
                "token": fcm_token[:20] + "..."
            }

        except messaging.UnregisteredError:
            print(f"❌ FCM token is invalid or unregistered: {fcm_token[:20]}...")
            return {"status": "error", "message": "Invalid or unregistered token"}
        except messaging.SenderIdMismatchError:
            print(f"❌ FCM token doesn't match sender ID")
            return {"status": "error", "message": "Sender ID mismatch"}
        except Exception as e:
            print(f"❌ FCM notification error: {str(e)}")
            return {"status": "error", "message": str(e)}

    @staticmethod
    def send_bulk_notifications(
        notifications: List[Dict]
    ) -> Dict:
        """
        Send multiple push notifications using FCM v1 batch API

        Args:
            notifications: List of notification dicts with keys:
                - fcm_token: Firebase Cloud Messaging token
                - title: Notification title
                - body: Notification message
                - data: Optional data payload

        Returns:
            Summary of sent notifications
        """
        # Initialize if not already done
        FCMPushNotificationService.initialize()

        if not FCMPushNotificationService._initialized:
            return {"status": "error", "message": "Firebase not initialized"}

        if not notifications:
            return {"status": "error", "message": "No notifications to send"}

        try:
            messages = []

            for notif in notifications:
                fcm_token = notif.get("fcm_token")
                if not fcm_token:
                    continue

                message = messaging.Message(
                    notification=messaging.Notification(
                        title=notif.get("title"),
                        body=notif.get("body"),
                    ),
                    data=notif.get("data", {}),
                    android=messaging.AndroidConfig(
                        priority='high',
                        notification=messaging.AndroidNotification(
                            channel_id='default',
                            sound='default',
                            priority='high',
                            default_vibrate_timings=True,
                            default_light_settings=True,
                        ),
                    ),
                    token=fcm_token,
                )

                messages.append(message)

            if not messages:
                return {"status": "error", "message": "No valid FCM tokens"}

            # Send all messages in batch
            response = messaging.send_each(messages)

            success_count = response.success_count
            error_count = response.failure_count

            print(f"✅ Sent {success_count} FCM notifications, {error_count} failed")

            return {
                "status": "success",
                "sent": success_count,
                "failed": error_count,
                "responses": [
                    {
                        "success": r.success,
                        "message_id": r.message_id if r.success else None,
                        "error": str(r.exception) if not r.success else None
                    }
                    for r in response.responses
                ]
            }

        except Exception as e:
            print(f"❌ FCM bulk notification error: {str(e)}")
            return {"status": "error", "message": str(e)}

    @staticmethod
    async def send_message_notification(
        fcm_token: str,
        sender_name: str,
        message_preview: str,
        message_id: int
    ):
        """Send notification for a new message"""
        return FCMPushNotificationService.send_notification(
            fcm_token=fcm_token,
            title=f"New message from {sender_name}",
            body=message_preview,
            data={
                "type": "message",
                "messageId": str(message_id),
                "action": "open_messages"
            }
        )

    @staticmethod
    async def send_attendance_notification(
        fcm_token: str,
        student_name: str,
        status: str,
        date: str
    ):
        """Send notification for attendance update"""
        status_emoji = "✅" if status.lower() == "present" else "❌"
        return FCMPushNotificationService.send_notification(
            fcm_token=fcm_token,
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
        fcm_tokens: List[str],
        title: str,
        message: str,
        announcement_id: int
    ):
        """Send bulk announcement notifications"""
        notifications = [
            {
                "fcm_token": token,
                "title": title,
                "body": message[:100] + "..." if len(message) > 100 else message,
                "data": {
                    "type": "announcement",
                    "announcementId": str(announcement_id),
                    "action": "open_announcements"
                }
            }
            for token in fcm_tokens
        ]

        return FCMPushNotificationService.send_bulk_notifications(notifications)

    @staticmethod
    def send_to_topic(
        topic: str,
        title: str,
        body: str,
        data: Optional[Dict] = None
    ) -> Dict:
        """
        Send notification to all devices subscribed to a topic

        Args:
            topic: Topic name (e.g., 'all_parents', 'class_8A')
            title: Notification title
            body: Notification message
            data: Optional data payload

        Returns:
            Response dict with status
        """
        FCMPushNotificationService.initialize()

        if not FCMPushNotificationService._initialized:
            return {"status": "error", "message": "Firebase not initialized"}

        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                android=messaging.AndroidConfig(
                    priority='high',
                    notification=messaging.AndroidNotification(
                        channel_id='default',
                        sound='default',
                        priority='high',
                    ),
                ),
                topic=topic,
            )

            response = messaging.send(message)

            print(f"✅ FCM topic notification sent to '{topic}': {response}")
            return {"status": "success", "message_id": response}

        except Exception as e:
            print(f"❌ FCM topic notification error: {str(e)}")
            return {"status": "error", "message": str(e)}
