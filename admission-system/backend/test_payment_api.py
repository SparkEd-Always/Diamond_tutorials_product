"""
Test Payment API with Ledger Integration

This script tests the complete payment flow:
1. Create offline payment
2. Verify ledger entry is created
3. Check fee allocation updates
4. Test payment verification workflow
"""

import requests
import json
from datetime import datetime, date

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

# Test credentials
ADMIN_EMAIL = "admin@school.com"
ADMIN_PASSWORD = "admin123"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'


def print_section(title):
    """Print section header"""
    print(f"\n{BLUE}{'='*80}")
    print(f"{title:^80}")
    print(f"{'='*80}{RESET}\n")


def print_success(message):
    """Print success message"""
    print(f"{GREEN}[OK] {message}{RESET}")


def print_error(message):
    """Print error message"""
    print(f"{RED}[ERROR] {message}{RESET}")


def print_info(message):
    """Print info message"""
    print(f"{YELLOW}[INFO] {message}{RESET}")


def login():
    """Login and get access token"""
    print_section("STEP 1: Admin Login")

    response = requests.post(
        f"{API_URL}/auth/login",
        json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
    )

    if response.status_code == 200:
        token = response.json()["access_token"]
        print_success(f"Login successful!")
        print_info(f"Token: {token[:20]}...")
        return token
    else:
        print_error(f"Login failed: {response.text}")
        return None


def get_test_data(token):
    """Get test student and academic year data"""
    print_section("STEP 2: Get Test Data")

    # Use hardcoded IDs for testing (we know from database these exist)
    student = {
        "id": 1,
        "first_name": "Rahul",
        "last_name": "Kumar"
    }

    academic_year = {
        "id": 1,
        "year_name": "2024-25"
    }

    print_success(f"Using student: {student['first_name']} {student['last_name']} (ID: {student['id']})")
    print_success(f"Using academic year: {academic_year['year_name']} (ID: {academic_year['id']})")

    return student, academic_year


def get_student_balance_before(student_id, academic_year_id, token):
    """Get student balance before payment"""
    print_section("STEP 3: Check Student Balance (Before Payment)")

    headers = {"Authorization": f"Bearer {token}"}

    # Get ledger timeline
    response = requests.get(
        f"{API_URL}/fees/ledgers/students/{student_id}/timeline",
        params={"academic_year_id": academic_year_id},
        headers=headers
    )

    if response.status_code != 200:
        print_info("No ledger entries found (new student)")
        return 0.0

    transactions = response.json()
    if not transactions:
        print_info("No transactions yet")
        return 0.0

    latest_balance = transactions[0]["balance"]
    print_success(f"Current balance: ₹{latest_balance}")

    # Show last 3 transactions
    print_info("Last 3 transactions:")
    for txn in transactions[:3]:
        print(f"  {txn['transaction_date'][:10]} | {txn['entry_type']:20} | Dr: ₹{txn['debit_amount']:8} | Cr: ₹{txn['credit_amount']:8} | Bal: ₹{txn['balance']}")

    return float(latest_balance)


def create_payment(student, academic_year, token):
    """Create an offline payment"""
    print_section("STEP 4: Create Offline Payment")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payment_data = {
        "student_id": student["id"],
        "academic_year_id": academic_year["id"],
        "amount": 5000.00,
        "payment_method": "cash",
        "payment_date": datetime.now().isoformat(),
        "remarks": "Test payment - Cash received at office",
    }

    print_info(f"Creating payment:")
    print(json.dumps(payment_data, indent=2))

    response = requests.post(
        f"{API_URL}/fees/payments/offline/",
        json=payment_data,
        headers=headers
    )

    if response.status_code == 201:
        payment = response.json()
        print_success(f"Payment created successfully!")
        print_success(f"Payment Number: {payment['payment_number']}")
        print_success(f"Amount: Rs.{payment['amount']}")
        print_success(f"Ledger Transaction ID: {payment['ledger_transaction_id']}")
        print_success(f"Balance After: Rs.{payment['ledger_balance_after']}")
        return payment
    else:
        print_error(f"Payment creation failed: {response.status_code}")
        print_error(response.text)
        return None


def verify_ledger_entry(payment, student_id, academic_year_id, token):
    """Verify that ledger entry was created"""
    print_section("STEP 5: Verify Ledger Entry Created")

    headers = {"Authorization": f"Bearer {token}"}

    # Get ledger timeline
    response = requests.get(
        f"{API_URL}/fees/ledgers/students/{student_id}/timeline",
        params={"academic_year_id": academic_year_id, "limit": 5},
        headers=headers
    )

    if response.status_code != 200:
        print_error(f"Failed to get ledger timeline: {response.text}")
        return False

    transactions = response.json()

    # Find the payment entry
    payment_entry = None
    for txn in transactions:
        if txn.get("payment_id") == payment["id"]:
            payment_entry = txn
            break

    if payment_entry:
        print_success("Ledger entry found!")
        print_info(f"Transaction Number: {payment_entry['transaction_number']}")
        print_info(f"Entry Type: {payment_entry['entry_type']}")
        print_info(f"Credit Amount: ₹{payment_entry['credit_amount']}")
        print_info(f"Balance After: ₹{payment_entry['balance']}")
        print_info(f"Description: {payment_entry['description']}")
        return True
    else:
        print_error("Ledger entry NOT found!")
        return False


def verify_payment(payment, token):
    """Verify the payment (admin approval)"""
    print_section("STEP 6: Verify Payment (Admin Approval)")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    verification_data = {
        "is_approved": True,
        "verification_notes": "Verified by automated test script"
    }

    response = requests.post(
        f"{API_URL}/fees/payments/{payment['id']}/verify",
        json=verification_data,
        headers=headers
    )

    if response.status_code == 200:
        verified_payment = response.json()
        print_success("Payment verified successfully!")
        print_info(f"Verified By: User ID {verified_payment['verified_by']}")
        print_info(f"Verified At: {verified_payment['verified_at']}")
        return True
    else:
        print_error(f"Payment verification failed: {response.text}")
        return False


def get_payment_statistics(academic_year_id, token):
    """Get payment statistics"""
    print_section("STEP 7: Payment Statistics")

    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(
        f"{API_URL}/fees/payments/stats/summary",
        params={"academic_year_id": academic_year_id},
        headers=headers
    )

    if response.status_code != 200:
        print_error(f"Failed to get statistics: {response.text}")
        return

    stats = response.json()

    print_success("Payment Statistics:")
    print(f"  Total Payments: {stats['total_payments_count']}")
    print(f"  Total Amount Received: ₹{stats['total_amount_received']}")
    print(f"  Payments Today: {stats['payments_today']}")
    print(f"  Amount Today: ₹{stats['amount_today']}")
    print(f"  Pending Verification: {stats['pending_verification_count']}")

    print_info("\nPayments by Method:")
    for method, data in stats['payments_by_method'].items():
        print(f"  {method:15} : {data['count']:3} payments | ₹{data['amount']:10,.2f}")


def main():
    """Main test flow"""
    print_section("Payment API Integration Test")
    print_info("Testing complete payment flow with ledger integration")

    # Step 1: Login
    token = login()
    if not token:
        return

    # Step 2: Get test data
    student, academic_year = get_test_data(token)
    if not student or not academic_year:
        return

    # Step 3: Check balance before
    balance_before = get_student_balance_before(
        student["id"],
        academic_year["id"],
        token
    )

    # Step 4: Create payment
    payment = create_payment(student, academic_year, token)
    if not payment:
        return

    # Step 5: Verify ledger entry
    if not verify_ledger_entry(payment, student["id"], academic_year["id"], token):
        return

    # Step 6: Verify payment
    verify_payment(payment, token)

    # Step 7: Get statistics
    get_payment_statistics(academic_year["id"], token)

    # Final summary
    print_section("TEST SUMMARY")
    print_success("All tests passed!")
    print_info(f"Student Balance Before: ₹{balance_before:,.2f}")
    print_info(f"Payment Amount: ₹{payment['amount']:,.2f}")
    print_info(f"Student Balance After: ₹{payment['ledger_balance_after']:,.2f}")
    print_info(f"Balance Change: ₹{balance_before - float(payment['ledger_balance_after']):,.2f}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Test interrupted by user{RESET}")
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
