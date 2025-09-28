import pandas as pd

# All extracted data compiled into the required format
fedena_modules_data = [
    # Core Modules (22)
    {
        "Module Name": "Multiple Dashboards",
        "Description": "Dashboard in school ERP system provides a 360-degree view on various tasks or events or functions happening in the school at any given time. Using this, stakeholders can quickly get a track on their imperative KPI's in a single view; also, all the information on the dashboard get automatically updated in real-time.",
        "Features": "- Customizable and dashlets driven dashboard\n- A glimpse of daily updates like finance transactions, student/employee attendance, birthdays, gallery photos\n- Quickly publish latest news and updates\n- Reporting managers can see and instantly approve/reject employee leave applications\n- User-friendly platform and easy to learn",
        "Source URL": "https://fedena.com/feature-tour/customizable-dashboard"
    },
    {
        "Module Name": "News Management",
        "Description": "Share the latest news and school-related information with your employees and student and always keep them up to date with this news management module.",
        "Features": "- Effortlessly create news by adding images, videos, rich text, etc.\n- The administrator can publish news with employees and students\n- Add multiple attachments with the school news for better clarity on the content\n- Commenting on the news can be done\n- Option to moderate the comments by administrators is also available",
        "Source URL": "https://fedena.com/feature-tour/school-news-management-system"
    },
    {
        "Module Name": "Timetable",
        "Description": "Fedena school timetable management system has been helping schools and colleges of various sizes in scheduling and managing timetables flawlessly. In a single click, admin can allocate a substitute teacher to the class in case the teacher is absent, automatic timetable management system promotes the paperless environment and simplifies the payroll calculation for admins.",
        "Features": "- Easily schedule and manage the timetable\n- Administrator can pre-set timetable for all classes for any term\n- Create different class timing sets for different types of periods\n- Effortlessly allocate subject to the teacher\n- Teachers can check their timetable from their login and plan accordingly\n- Students can check complete timetable for week or specific day activities\n- Easily manage classroom allocations\n- Institutional timetable report can be taken out for analysis or notice board\n- When executing swap, send instant notification to teachers",
        "Source URL": "https://fedena.com/feature-tour/timetable-management-system"
    },
    {
        "Module Name": "Student Admission",
        "Description": "Student admission management system by Fedena to simplify and streamline the chaotic and time-consuming admission process. Manually managing the admission procedure is an overwhelming task for the school's administrator, and sometimes this cumbersome process leads to human error.",
        "Features": "- Verify original documents digitally and collect admission fee in a click\n- Automatic allotment of batches & subjects to students\n- Customize admission form according to institution needs\n- Set student contact and direct emails/SMS\n- Send timely updates about admission test dates, results, etc.\n- Store academic records of all students including alumni\n- Save essential documents in digital format\n- Store employee documents and details\n- Generate custom reports\n- Save additional student and employee information\n- Parents/students can enquire about courses before registration\n- Admin gets overview of open and closed enquiries\n- Track lead sources\n- Plan future marketing campaigns\n- Students can fill and submit admission forms online\n- Submit digital document copies\n- Reduce form-filling errors\n- Eliminate unnecessary paperwork",
        "Source URL": "https://fedena.com/feature-tour/student-admission-management-system"
    },
    {
        "Module Name": "Messaging System",
        "Description": "Messaging System by Fedena is a fast, secure, and cost-effective inbuilt communication system which strengthens the relationship among parents, teachers, and students.",
        "Features": "- Notify parents, students, and teachers about the latest information\n- Send out targeted information to parents/students about events, fee dues, etc.\n- Real-time messaging to teachers about upcoming PTA meetings\n- Keep users updated about assigned responsibilities\n- Paperless solution",
        "Source URL": "https://fedena.com/feature-tour/messaging-system"
    },
    {
        "Module Name": "Student Attendance",
        "Description": "Daily manually maintaining attendance is a mandatory task for every teacher, but because of its tiresome and time killing process, it indirectly impacts the productivity of the teachers. But with Fedena attendance management system, teachers can quickly and accurately record the attendance without putting much effort and at the same time can generate reports in a single click.",
        "Features": "- Set attendance type day-wise or subject-wise\n- Mark student attendance for half/full day with/without reason\n- Enable custom attendance to count latecomers\n- Employees can apply for leave through Fedena\n- Reporting managers can instantly approve/deny leave requests\n- Track employee attendance and leave\n- Automate payroll process\n- Reduce human error\n- Generate student day-wise/batch-wise attendance reports\n- Manage leave reports in a single click\n- Minimize paper wastage\n- Automatically collect attendance data\n- Eliminate proxy attendance\n- Monitor real-time student movement within premises\n- Manage attendance from anywhere\n- Students can apply for leave\n- Instant notifications to parents and faculty",
        "Source URL": "https://fedena.com/feature-tour/student-attendance-management-system"
    },
    {
        "Module Name": "Courses and Batches",
        "Description": "With Fedena course and batches management system, admins can easily create/edit/delete the course, also access the student's details according to course/batch-wise. Add student category, manage the subject details corresponding to a different course.",
        "Features": "- Supports variations of courses and batches across institution levels\n- Send SMS to targeted audience or groups\n- Store and display student documents and records\n- Assign class teachers with specific privileges\n- Assign roll numbers to students within a batch\n- Adaptable to institution's system through configuration\n- Academic year setup for examination management\n- Supports 23 language options and multiple time zones\n- Auto-logout for user inactivity\n- Single Sign-On for Microsoft and Google\n- Configurable SMS settings",
        "Source URL": "https://fedena.com/feature-tour/courses-and-batches"
    },
    {
        "Module Name": "Human Resources",
        "Description": "Handling the human resource department accurately in one of the most critical functions of every institute. With Fedena, school HR management system, organizations can easily administer all the HR related processes without wasting much time and effort.",
        "Features": "- A single platform to manage employees details - data, leaves, payroll, payslip generation, etc.\n- Customizable admission form to upload the employee details in one go\n- Bulk import option allows uploading details of employees in fractions of seconds\n- Do payroll setup for variations of earnings and deductions\n- Instant amount of changes in payroll is supported\n- Revert the archived employees details back if they are deleted by mistake\n- Employee with privileges can generate payslips based on payment frequency\n- Payroll can be collectively assigned to employees sharing similar pay structure & frequency\n- Assign independent privileges for approval/rejection/regeneration of payslip for employees\n- Configure payslip report settings & generate leave balance report for selected duration\n- Loss of Pay integration with automatic deduction calculation in employees' payslip\n- Loss of Pay can now be calculated either by using Loss of Pay Days(LOPD) or Number of Days Worked(NDW)",
        "Source URL": "https://fedena.com/feature-tour/school-HR-management-system"
    },
    {
        "Module Name": "Finance",
        "Description": "School Fees management system to automate and streamline the fees processes. Staff can keep a real-time track on fees collection and pending fees. Generate various fee structure, customized reports, and fees receipt, also send instant alerts to parents in case fee dues.",
        "Features": "- Incorporates all types of fee structures\n- Schedule fee collection dates\n- Create Master Particular and Discounts\n- Mobile app for fee payments\n- Design customizable fee receipt templates\n- View receipts from single dashboard\n- Invoice for pre-scheduled fees\n- Collect fees in advance\n- Check fee defaulters report\n- Send reminders via SMS/email\n- Online payment gateway integration\n- View income & expense transactions\n- Record institute transactions\n- Generate particular-wise reports\n- Compare financial transactions\n- Provide fixed/instant discounts\n- Enable tax on fee transactions\n- Fees refund/revert\n- Create and manage tax slabs\n- Manage staff salaries\n- Create donations\n- Controlled user access\n- Group transactions under fee account",
        "Source URL": "https://fedena.com/feature-tour/school-fees-management-system"
    },
    {
        "Module Name": "Examination",
        "Description": "With Fedena Gradebook & Examination Management System, eliminate the unnecessary cost and paper wastage incurred during the examination process. Institute can conduct descriptive and objective type examination, generate multiple reports, terminate the report card printing, reduce workload for school staff, provide instant feedback on student progress and access to view their results in a single click.",
        "Features": "- Edit or delete exam schedule at any time\n- Connect Exam feature, fast forward the final grade/marks calculation\n- Schedule exam for all batches of a class simultaneously\n- Easily edit student marks for active and inactive batches\n- Flexibility for teachers to enter and update marks\n- Create batch & course wise exam report\n- Create subject or assessment wise report for various grading systems\n- Customize report card field settings\n- Quick assessment and publishing of exam reports\n- Instantly send exam result alerts to parents\n- Import marks in bulk\n- Provide comprehensive student, subject, and consolidated reports\n- Create student activity & marks based grading exams\n- Skill-based mark entry for each subject\n- Customizable report card templates\n- Show student records and remarks in Gradebook Reports\n- Enter marks/grades from mobile app\n- Check mark submission status for specific exams",
        "Source URL": "https://fedena.com/feature-tour/exam-management-system"
    },
    {
        "Module Name": "User Management",
        "Description": "Manually managing details of employees, students, parents, and other staff members is a tiresome task for the admin. But with Fedena User Management System, admin can search any user using their assigned IDs, edit their profile details, change the password, and assign privileges.",
        "Features": "- Administrators can manage all Fedena users using this module\n- Set various levels of access controls for the employees\n- Profile update can be done for the users by the privileged employees\n- Block users from accessing the application for reasons like non-payment of dues in a click",
        "Source URL": "https://fedena.com/feature-tour/school-user-management-system"
    },
    {
        "Module Name": "Report Center",
        "Description": "With Fedena Report Center, admins can create multiple reports, easily access these reports from a centralized place, eliminate the paper-based activities, keep an eye on all ongoing events, quickly identifies the problems and errors in the system and promptly make better decisions which improve the institute efficiency.",
        "Features": "- Check reports related to finance, users, course, payroll, and others\n- Get a detailed level report of the core data\n- Reports are dynamic and automatically updated as data changes\n- Each report can be sorted based on columns\n- Export reports in CSV file format",
        "Source URL": "https://fedena.com/feature-tour/reports-center"
    },
    {
        "Module Name": "Employee/Teacher Login",
        "Description": "Fedena school ERP system provides employee and teacher login module using which school staff can keep a track on their daily tasks, manage their time-consuming operations like a pro and focus on their essential tasks, i.e. delivering high-quality knowledge to students.",
        "Features": "- Employees attendance can be captured using biometric device integration\n- Employees can keep a track on their leaves application and its approval\n- Teachers can do subject mark entry and daily subject assignments\n- Teachers can check the assigned timetable from their dashboard\n- With special privileges, employees can collect fees, manage inventory, hostel, transport, etc.\n- With unique login credential, users can perform activity based on assigned privileges",
        "Source URL": "https://fedena.com/feature-tour/employee-teacher-login"
    },
    {
        "Module Name": "Students/Parents Login",
        "Description": "With robust School ERP system, parents can keep a track on their wards academic progress, easily communicate with the teachers and discuss the strategies which can improve their child learning outcomes.",
        "Features": "- After admitting in Fedena system, user get their credentials via email or SMS\n- Students can submit assignments and check their progress\n- Parents can track the student's attendance and check the exam reports\n- Students can participate in discussions\n- Students can communicate via various available methods\n- See notifications about the upcoming events\n- Students can check the academic calendar to plan their studies",
        "Source URL": "https://fedena.com/feature-tour/students-parents-login"
    },
    {
        "Module Name": "Student Information",
        "Description": "Track Data, Edit Profile and Manage alumni records. With student information management feature easily collated and manage all student-related information at one place such as personal details, attendance, any discipline issues, any achievement in or out of school, and more.",
        "Features": "- Easily view student details based on section/batch-wise\n- Check the student's profile for fees, assigned activities, daily remarks, attendance, etc.\n- Search archived/graduated students for fetching records\n- An administrator can filter the data based on the search criteria and generate required student reports",
        "Source URL": "https://fedena.com/feature-tour/student-management-system"
    },
    {
        "Module Name": "Custom Student Remarks",
        "Description": "An administrator can add/delete/edit remarks for each student based on their performances on the individual exam or term or in the subject. With Custom student remarks module, teachers can instantly publish constructive criticism to improve the performance of the students and send instant alerts to parents.",
        "Features": "- Provide comments/common remarks for each student based on performance on different subjects\n- Add common comments on an individual student for any conducted exam\n- Share custom remarks on students' day-to-day activities\n- Students or parents can see comments in their profiles for daily updates\n- Create Remark templates using the Remark Bank\n- Add remarks from the remark bank to students from the Manage Remarks page",
        "Source URL": "https://fedena.com/feature-tour/custom-student-remarks"
    },
    {
        "Module Name": "Certificate Generator",
        "Description": "Generate various type of certificate for students and staff members bonafide certificate, transfer certificate, migration certificate, offer appointment certificate, and more. With Fedena certificate generator saves time and efforts and easily keep a record of all generated certificate on a centralized place.",
        "Features": "- Use field codes to show system data as well as custom data in the certificate\n- Upload backgrounds, add user photos, & barcodes to customize certificate as per requirement\n- Create templates for students or employees with the Rich Text Editor\n- Certificates can be generated in bulk or individually for selected users",
        "Source URL": "https://fedena.com/feature-tour/certificate-generator"
    },
    {
        "Module Name": "ID Card Generator",
        "Description": "Designing an ID card for students, staff members, and visitors like a pro with minimal time and effort can only be achieved by Fedena ID card generator module.",
        "Features": "- Create templates for student and employee ID cards\n- Design one or both sides of ID cards\n- Add background images\n- Include custom and system data using field codes\n- Generate ID cards in bulk or individually\n- Support two sizes: A4 Canvas or ID card size",
        "Source URL": "https://fedena.com/feature-tour/school-id-card-generator"
    },
    {
        "Module Name": "SMS Integration",
        "Description": "Bridge the communication gap among parents, teachers, students, and other staff members with SMS integration in school ERP.",
        "Features": "- Send text messages to users\n- Deliver automatic notifications for certain events\n- Allow administrators and employees to send/receive text messages\n- Customize SMS settings to deliver automatic alert messages to mobile phones",
        "Source URL": "https://fedena.com/feature-tour/sms-integration"
    },
    {
        "Module Name": "School/Events Calendar",
        "Description": "Institute's daily schedule can be maintained in Fedena calendar. Students, parents and employees can check the upcoming events, examinations, fees dues and plan accordingly.",
        "Features": "- Share upcoming events & holidays\n- Mark online examination dates\n- Mark fee due dates\n- Get in-depth event details with a single click by selecting event color",
        "Source URL": "https://fedena.com/feature-tour/event-calendar-management-system"
    },
    {
        "Module Name": "Advance Fees",
        "Description": "Allows collecting fees in advance for future payments. Can be used for future payments like transport fees, academic fees, and other pre-scheduled fees.",
        "Features": "- Collect fees in advance and use it later for the future fee's payment\n- Provides invoices for pre-scheduled fees (general, hostel, transport)",
        "Source URL": "https://fedena.com/feature-tour/school-fees-management-system#advance-fees"
    },
    {
        "Module Name": "Gradebook",
        "Description": "Part of Fedena's Examination Management System, which aims to eliminate unnecessary cost and paper wastage in the examination process while providing instant feedback on student progress.",
        "Features": "- Import marks in bulk and import planner for new academic year\n- Provide consolidated reports for students and subjects\n- Create student activity and marks-based grading exams\n- Allow skill-based mark entry for each subject to display on report card\n- Offer new report card templates for customizing term and planner reports\n- Show student records and remarks in exam planner reports\n- Employees can enter marks/grades via mobile app for specific exams, terms, skills, and activities\n- Check mark submission status for specific exams",
        "Source URL": "https://fedena.com/feature-tour/exam-management-system#gradebook"
    },

    # Addon Modules (37)
    {
        "Module Name": "Hostel/Dormitory",
        "Description": "Delivering safety and comfort to the students is the primary responsibility of every schools and college, and Fedena hostel management system module is the key to that.",
        "Features": "- Assign rent/fare for the room\n- Create custom fields to save additional hostel information\n- Check room availability in a single click\n- Schedule hostel fees collection\n- Generate invoice for pre-scheduled hostel fees\n- Collect hostel fees along with academic fees\n- Analyze reports for room/rent changes\n- Warden can maintain details about:\n  * Number of rooms\n  * Room types\n  * Room allocation\n  * Number of students per room",
        "Source URL": "https://fedena.com/feature-tour/hostel-management-system"
    },
    {
        "Module Name": "Instant Fees",
        "Description": "Keep records of temporary fees like infrastructure fund, relief fund, teacher's day collection, etc.",
        "Features": "- Handles fees not scheduled on defined dates\n- Deals with temporary fee types separately\n- Allows tracking of special one-time fee collections",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#instantfees"
    },
    {
        "Module Name": "Library",
        "Description": "Automate cataloging, Trace Defaulters and Check books availability. It automates and organized the library operations also helps in maintaining the book details present in the library.",
        "Features": "- Barcode integration to organize and manage book details\n- Complete track on issued/renewed books with barcode scanning\n- Manage all books details in a single place\n- Students can search book details from their dashboard and issue/renew\n- Librarian can tally records by generating lists of books issued or due\n- Export book details in CSV file\n- Create digital library fine receipt\n- Generate customized reports for library inventory and fine collection",
        "Source URL": "https://fedena.com/feature-tour/library-management-system"
    },
    {
        "Module Name": "Data Management",
        "Description": "Data is the primitive component for every institution, and manually managing data is not only a laborious task but also prone to deterioration over time. With the Fedena Data Management, automate the complete process and decrease the chances of a data breach and cyber attacks.",
        "Features": "- Record detailed information about any data\n- Data backup facility\n- Export data in CSV or XML format\n- Authorized user can easily access student personal details\n- Centralized place to institute data\n- Add a new entry into the existing category\n- Print records in a single click\n- Easily customize fields and add information on records\n- Save records in the form of reports for analysis and record keeping",
        "Source URL": "https://fedena.com/feature-tour/school-database-management-system"
    },
    {
        "Module Name": "Email Integration",
        "Description": "Automatic emails can be setup for a particular set of recipients on specific events such as exam results, a new student admitted, fees pending, and more.",
        "Features": "- Send email to employees or students or guardians\n- Customise the email setting to communicate with parents, students, and employees efficiently",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#mail-integration"
    },
    {
        "Module Name": "Transportation",
        "Description": "Student's safety is the topmost priority of educational institute. With school bus transport management module, the parents and school staff members can easily track the vehicle location while the students are traveling from home to school or vice-versa.",
        "Features": "- Maintain vehicle information (routing, stops, student allotment, fees, expenses)\n- Add custom fields for additional information\n- Create and manage routes and stops by academic year\n- Collect fares based on stops or flat amount\n- Assign bus routes to students and employees\n- Schedule transport fee collections\n- Define vehicle routes with pickup/drop options\n- Send instant alerts to parents about route changes\n- Enhance safety for drivers and students",
        "Source URL": "https://fedena.com/feature-tour/school-bus-management-system"
    },
    {
        "Module Name": "Custom Import",
        "Description": "Upload and edit data/ information in bulk using CSV format",
        "Features": "- Import student data\n- Add bulk employees detail\n- Add parents detail\n- Import student examination scores\n- Import daily attendance information of students\n- Import library book details\n- Import inventory details",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#custom-import-data"
    },
    {
        "Module Name": "Blog",
        "Description": "Teachers can use a blog to post information & resources for students for classroom tasks",
        "Features": "- Students can assess their performance by checking comments and remarks by their teachers\n- Discussion on critical prevalent topics using this module confers a healthy learning environment",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#blog-page"
    },
    {
        "Module Name": "Poll",
        "Description": "Poll helps to collect opinions on a particular subject from a group of selected members without revealing the identity of the person.",
        "Features": "- Take an informed decision with the involvement of students and employees",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#poll-system"
    },
    {
        "Module Name": "Custom Report",
        "Description": "Customise the report details to generate the specific type of report",
        "Features": "- Input criteria can be selected based on which the report should be filtered\n- Columns required in the report can be selected\n- The report automatically updates based on the changes in profile data of students or employees",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#customized-report"
    },
    {
        "Module Name": "Theme",
        "Description": "The administrator can set a color theme and font style of their choice from the color picker option available in settings",
        "Features": "- Color theme selection via color picker\n- Font style customization\n- Settings-based theme configuration",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#theme-setup"
    },
    {
        "Module Name": "Placement",
        "Description": "Streamline campus recruitment, Track applicant status, and Instant result announcement",
        "Features": "- Organize and streamline the campus recruitment process\n- Students can apply for the placement event and can check status\n- Eligible students can be authorized to participate in the event\n- Results can be declared\n- Related reports can be taken out for analysis and announcements",
        "Source URL": "https://fedena.com/feature-tour/placement-management-system"
    },
    {
        "Module Name": "Gallery",
        "Description": "Modern and refreshed UI",
        "Features": "- Share outstanding pictures and screenshot with students or employees by creating an album\n- Add multiple photos to the album at once\n- Two modes available for sharing photos: Private and Public\n- Public albums can be used to share images across all users\n- Multiple photos upload and complete album delete are handy features for quick updates",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#event-gallery"
    },
    {
        "Module Name": "Task",
        "Description": "Task module is used to assign tasks to staff or students by their managers/admin.",
        "Features": "- Employees/Students can upload documents and update assigned tasks\n- Managers/Teachers can post comments for follow-ups",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#tasks"
    },
    {
        "Module Name": "Inventory",
        "Description": "Fedena, school inventory management system, takes care of your institute's purchase orders, goods' invoices, in-house stock management, detailed asset reports, obsolete equipment tracking, and other assets tracking.",
        "Features": "- Manage indents and purchasing items for institution\n- Complete tracking on the inventory management process\n- Manage store items and employees can raise indents when items are required\n- Store manager can:\n  - Add stores\n  - Add store items\n  - Build indents\n  - Raise purchase orders\n  - Create GRN notes\n- Create invoices and goods received notes",
        "Source URL": "https://fedena.com/feature-tour/school-inventory-management-system"
    },
    {
        "Module Name": "Discussion",
        "Description": "It helps the students and teachers to interact with each other and exchange info and ideas.",
        "Features": "- Share their views through posting comments or messages\n- Members of the group get the privilege to see the posts and comment on them\n- The admin can delete unwanted posts",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#discussion-data"
    },
    {
        "Module Name": "Discipline",
        "Description": "Users can file a complaint or issue against teachers or students",
        "Features": "- Assign Employees and students responsible for solving the problem\n- Upload proof/evidence information like attachments, photos, documents, etc\n- Mark actions based on discussions and solutions for the disciplinary complaint",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#discipline-track"
    },
    {
        "Module Name": "Data Export",
        "Description": "Export data of students, employees, subjects, attendance, etc. in xml or csv formats for various purposes.",
        "Features": "- Export data in xml or csv formats\n- Helps with data backup\n- Enables data transfer to another application\n- Supports data analysis\n- Facilitates data-driven decision making",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#export-data"
    },
    {
        "Module Name": "Tally Integration",
        "Description": "You can synchronize Fedena to Tally by selecting the start and end date for the manual synchronisation",
        "Features": "- Quickly transfer all transactions from Fedena to Tally\n- Schedule bulk export for Tally from Fedena for transactions performed during a specific duration",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#tally"
    },
    {
        "Module Name": "Payment Gateway Integration",
        "Description": "Fully functional payment gateway to enable your institution to accept online payment through credit cards",
        "Features": "- Enable payment option for:\n  * Student Academic fees\n  * Applicant registration\n  * Hostel fees\n  * Transport Fees\n- Students and parents can:\n  * Check fee details\n  * Pay fees online\n  * Print fee receipts from mobile phones\n- Integrate Fedena with:\n  * Paypal\n  * Authorize.net",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#payment-gateway"
    },
    {
        "Module Name": "Student Assignment Management",
        "Description": "Student assignment management module helps in creating an online assignment/homework/quizzes/surprise test for the students. Teachers can create the assignment for assigned classes; she can also monitor the student's academic progress and instantly share the results or feedback with parents and students.",
        "Features": "- Help teachers distribute homework and assignments to students in one go\n- Promote time-saving and zero paper wastage\n- Teachers can collect completed work, review it and provide feedback to students\n- While distributing work, teachers can attach digital content/resource\n- Teachers can instruct students to submit their work as an uploaded file, or as direct text information\n- Assign due dates while sharing an assignment with students",
        "Source URL": "https://fedena.com/feature-tour/student-assignment-management-system"
    },
    {
        "Module Name": "Fees Import",
        "Description": "This option allows the administrator to manage student fee collections easily.",
        "Features": "- Assigned to or unassigned students from scheduled fees",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#fee-import"
    },
    {
        "Module Name": "Google SSO",
        "Description": "Fedena Google app integration saves you from the ordeal of losing your Fedena username and password.",
        "Features": "- Log in to your Fedena school management software account using your Google login details",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#google-sso-access"
    },
    {
        "Module Name": "Form Builder",
        "Description": "Create forms, share it with users and re-use it for different recipients",
        "Features": "- Use the form to collect feedback from students about classroom teaching\n- Head of departments can analyze the feedback to improve staff performance\n- Admin can access consolidated reports on each feedback option\n- Reports include categories under which options are rated in the form",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#form-build-er"
    },
    {
        "Module Name": "Reminder",
        "Description": "Send alerts to the users about any upcoming institutional event via SMS or email",
        "Features": "- Admin can set a reminder as many times about any type of upcoming activities in your school/institution\n- Most powerful use is in scheduling fee collections\n- Reminders can be set multiple times with multiple options available in settings",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#reminder-alerts"
    },
    {
        "Module Name": "App Frame",
        "Description": "Add independent application inside Fedena's frame",
        "Features": "- Easy to use and hassle-free\n- Allows 3rd party clients to become Fedena Oauth clients with some limitations\n- Users can browse to add new apps\n- Users can edit or delete old apps",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#app-frames"
    },
    {
        "Module Name": "Enquiry & Registration",
        "Description": "Create an online registration form and publish the form on your institute website.",
        "Features": "- Set subject-based registration and contact applicant via SMS and Email\n- Generate detailed report of applicant data, printable application form, fee receipts\n- Create and manage different stages of an enquiry\n- Assign enquiries to counselors to manage the process\n- Linked to the academic year to get a complete admission flow\n- Collect enquiries from various resources by embedding form in institution's website\n- Filter New, Qualified, Processed & Rejected enquiries based on parameters\n- Create quantitative reports such as course-wise, source-wise, and counselor-wise",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#enquiry-registration"
    },
    {
        "Module Name": "Alumni",
        "Description": "Keep the records of all pass out students with the vital pieces of information",
        "Features": "- Manage alumni records by growing the network of professional contacts\n- Communicate with alumni via SMS or email\n- Engage alumni for career guidance and training activities\n- Enable mutual knowledge exchanges",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#alumni-records"
    },
    {
        "Module Name": "Audit",
        "Description": "Monitor and track the user activities in different departments like finance activities, managing user accounts and scheduling or deleting activities related to the core data",
        "Features": "- Track fees to specific student profiles as well as teacher profiles\n- Admin can clearly track all activities each user performs when it comes to fee transactions\n- Collect information on: Scheduling fee collection, Collecting fees, Reverting collected fees\n- All activities are listed in logs",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#audit-track"
    },
    {
        "Module Name": "Azure Integration",
        "Description": "Microsoft Azure Active Directory (AD) Single Sign-On (SSO) allows Fedena users to log in to Fedena using their Microsoft account credentials, without using a Fedena username and password",
        "Features": "- Enables login using Microsoft account credentials\n- Eliminates need for separate Fedena username and password\n- Provides Single Sign-On (SSO) functionality through Azure Active Directory",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#azure"
    },
    {
        "Module Name": "Doc Manager",
        "Description": "Manage documents in one place, which can be downloaded by the users",
        "Features": "- Documents or folders can be shared to targeted users to distribute planned classroom activities or lecture plans\n- User-specific docs can be created to add documents for a student/employee",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#document-manager"
    },
    {
        "Module Name": "Automatic Timetable Generator",
        "Description": "In a single click, generate thousands of timetable and save a tremendous amount of time.",
        "Features": "- Set the placement & preference for the subjects in the timetable\n- Generated timetable incorporates common school scenarios like subject placement\n- Avoids teacher allocation clashes\n- Solves the manual process of adjusting subject overlaps and teacher subject limits",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#automatic-timetable"
    },
    {
        "Module Name": "Paybooks Integration",
        "Description": "Integrate Paybooks with Fedena to handle payroll and payslip related details.",
        "Features": "- Simplifies payroll and payslip generation process\n- Syncs all employee details such as employee type, designation, department, location in a single click\n- Employees can access their payslips with salary structure and deductions through Paybooks",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#paybook-integration"
    },
    {
        "Module Name": "Gate Management",
        "Description": "Gate management is mobile app first feature to handle entry of visitors and staff and exit of users.",
        "Features": "- Divided into 3 parts: Visitor Management, User Entry Management, and Gate Pass Management\n- Privileged employees can access reports in graph and tabular format on web and mobile app\n- Configure form settings, general settings like notifications, and prefix for pass number in web app\n- Entry/actions in management areas marked and handled in mobile app",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#gate-mgmt"
    },
    {
        "Module Name": "Google Docs",
        "Description": "Google Docs is available to view and upload in Fedena for the logged in employee or student.",
        "Features": "- Login with Google credentials\n- Upload/download Google Docs\n- Available for employees and students\n- Integration allows direct access within Fedena platform",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#google-document"
    },
    {
        "Module Name": "Online Examination",
        "Description": "Conduct surprise exams",
        "Features": "- Create timer based online exam\n- Can create an exam either descriptive type or MCQ type\n- Import questions from any last exam of a particular batch\n- Automatic marks calculation happens for objective exams based on settings\n- Exam results can be seen to get reports",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#online-examination"
    },
    {
        "Module Name": "QuickBooks Integration",
        "Description": "Efficiently manage all your accounting operations with QuickBooks Integration",
        "Features": "- View the auto-syncing record status in QuickBooks sync available in the Fedena ERP",
        "Source URL": "https://fedena.com/feature-tour/addon-modules#quickbooks"
    },
    {
        "Module Name": "Google Meet Integration",
        "Description": "Video conferencing integration for online meetings and classes",
        "Features": "- Integration with Google Meet for video conferencing\n- Support for online meetings and virtual classes",
        "Source URL": "https://fedena.com/integrations/#video-conference"
    }
]

# Create DataFrame
df = pd.DataFrame(fedena_modules_data)

# Save to Excel
output_file = "D:\\Projects\\sparked\\Fedena_Complete_Features_Extracted.xlsx"
df.to_excel(output_file, index=False)

print(f"Excel file created successfully: {output_file}")
print(f"Total modules processed: {len(fedena_modules_data)}")
print("- Core Modules: 22")
print("- Addon Modules: 37")
print("- Total: 59 modules")