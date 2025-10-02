# Admin Login Information

## Admin Credentials

The backend logs show **successful login attempts** with 200 OK responses, indicating that the admin login is working correctly.

### Available Admin Accounts

1. **Primary Admin**
   - Email: `admin@avm.com`
   - Password: `password123`
   - Name: Principal Rajesh Kumar

2. **Secondary Admin**
   - Email: `admin2@avm.com`
   - Password: `password123`
   - Name: Vice Principal Sunita Sharma

## How to Login

1. Open the web app at `http://localhost:3000`
2. Use either:
   - **Email**: `admin@avm.com`
   - **Password**: `password123`

## Backend Verification

The backend is running successfully and accepting login requests:
- ✅ Backend running on `http://localhost:8000`
- ✅ Database has active admin users
- ✅ Multiple successful login attempts recorded in logs (200 OK responses)
- ✅ Password hashing with bcrypt is working
- ✅ OAuth2 authentication flow is functional

## If Login Still Fails

If you're experiencing login issues despite the backend showing success:

1. **Check which web app you're using**: There are multiple web app processes running. Make sure you're accessing the correct one.

2. **Clear browser cache and localStorage**:
   - Open browser console (F12)
   - Go to Application tab
   - Clear Local Storage
   - Refresh the page

3. **Check browser console for errors**:
   - Open Developer Tools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab to see if the login request is reaching the backend

4. **Verify the correct port**:
   - Web app should be on `http://localhost:3000`
   - Backend API should be on `http://localhost:8000`

## Teacher Login

Teacher credentials are generated automatically when teacher data is imported through the Data Import page. Teachers **cannot login** until their data has been imported via CSV upload in the web app.

## Notes

- All passwords are securely hashed using bcrypt
- Admin accounts were created using `create_admin.py` script
- The backend logs show both successful (200 OK) and failed (401 Unauthorized) attempts, which is normal behavior when testing credentials
