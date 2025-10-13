"""
Test script for Form Management API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def get_token():
    """Login and get JWT token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "admin@school.com", "password": "admin123"}
    )
    return response.json()["access_token"]

def test_get_forms():
    """Test GET /forms endpoint"""
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    print("\n" + "="*60)
    print("Testing GET /api/v1/form-config/forms")
    print("="*60)

    response = requests.get(f"{BASE_URL}/form-config/forms", headers=headers)
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        forms = response.json()
        print(f"✅ SUCCESS - Found {len(forms)} forms")
        for form in forms:
            print(f"\nForm ID: {form['id']}")
            print(f"  Name: {form['form_name']}")
            print(f"  Description: {form.get('form_description', 'N/A')}")
            print(f"  Active: {form['is_active']}")
            print(f"  Field Count: {form['field_count']}")
    else:
        print(f"❌ FAILED - {response.text}")

    return response.status_code == 200

def test_create_form():
    """Test POST /forms endpoint"""
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    print("\n" + "="*60)
    print("Testing POST /api/v1/form-config/forms")
    print("="*60)

    new_form = {
        "form_name": "Test Form - Class 6-10",
        "form_description": "Admission form for middle and high school",
        "is_active": True,
        "template_id": 1  # CBSE Standard template
    }

    response = requests.post(
        f"{BASE_URL}/form-config/forms",
        headers=headers,
        json=new_form
    )
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        form = response.json()
        print(f"✅ SUCCESS - Created form ID: {form['id']}")
        print(f"  Name: {form['form_name']}")
        print(f"  Field Count: {form['field_count']}")
        return form['id']
    else:
        print(f"❌ FAILED - {response.text}")
        return None

def test_get_form_by_id(form_id):
    """Test GET /forms/{form_id} endpoint"""
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    print("\n" + "="*60)
    print(f"Testing GET /api/v1/form-config/forms/{form_id}")
    print("="*60)

    response = requests.get(f"{BASE_URL}/form-config/forms/{form_id}", headers=headers)
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        form = response.json()
        print(f"✅ SUCCESS - Retrieved form")
        print(f"  Name: {form['form_name']}")
        print(f"  Field Configurations: {len(form.get('field_configurations', []))}")
    else:
        print(f"❌ FAILED - {response.text}")

    return response.status_code == 200

def test_update_form(form_id):
    """Test PUT /forms/{form_id} endpoint"""
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    print("\n" + "="*60)
    print(f"Testing PUT /api/v1/form-config/forms/{form_id}")
    print("="*60)

    update_data = {
        "form_name": "Updated Test Form - Class 6-10",
        "is_active": False
    }

    response = requests.put(
        f"{BASE_URL}/form-config/forms/{form_id}",
        headers=headers,
        json=update_data
    )
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        form = response.json()
        print(f"✅ SUCCESS - Updated form")
        print(f"  New Name: {form['form_name']}")
        print(f"  Active: {form['is_active']}")
    else:
        print(f"❌ FAILED - {response.text}")

    return response.status_code == 200

def test_delete_form(form_id):
    """Test DELETE /forms/{form_id} endpoint"""
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    print("\n" + "="*60)
    print(f"Testing DELETE /api/v1/form-config/forms/{form_id}")
    print("="*60)

    response = requests.delete(f"{BASE_URL}/form-config/forms/{form_id}", headers=headers)
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"✅ SUCCESS - {result['message']}")
    else:
        print(f"❌ FAILED - {response.text}")

    return response.status_code == 200

if __name__ == "__main__":
    print("\n" + "="*60)
    print("FORM MANAGEMENT API TESTS")
    print("="*60)

    # Test 1: Get all forms
    test_get_forms()

    # Test 2: Create new form
    new_form_id = test_create_form()

    if new_form_id:
        # Test 3: Get form by ID
        test_get_form_by_id(new_form_id)

        # Test 4: Update form
        test_update_form(new_form_id)

        # Test 5: Delete form
        test_delete_form(new_form_id)

    # Test 6: Verify deletion
    print("\n" + "="*60)
    print("Final verification - Get all forms")
    print("="*60)
    test_get_forms()

    print("\n" + "="*60)
    print("ALL TESTS COMPLETED")
    print("="*60 + "\n")
