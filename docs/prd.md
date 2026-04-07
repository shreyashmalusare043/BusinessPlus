# Requirements Document

## 1. Application Overview

- **Application Name:** BusinessPlus
- **Description:** A multi-user internal billing and operations platform supporting company-level data isolation, GST compliance, billing, work orders, purchase orders, expenses tracking, delivery challans, stock management, dashboards, reporting with analytics, payment status tracking, a payment email automation system, a daily operations log for outsource and in-house work tracking, customer and supplier management with auto-fill support, a help and support submission form, account recovery options, a subscription and payment system with Free and Premium plans, an AI Assistant chat feature, multiple bill design templates, a dark mode toggle with persistent theme preference, and a custom color theme builder allowing users to create and save personalized interface color themes. Each user operates within their own isolated company environment. Admins have full access with no subscription requirement and can manage all registered users and monitor subscription and transaction data without accessing users' business data. New user registration requires email verification via a verification code before account activation — upon successful form submission, a verification code is sent to the registered email address, and the user must enter the code on the verification page to activate their account. After successful verification, the user is redirected to the Login Page. Login is performed using Email and OTP. The platform includes a Landing Page as the entry point, along with Privacy Policy, Terms & Conditions, Refund Policy, and Data Security Policy pages, with footer links and contextual checkboxes at relevant steps.

---

## 2. Users and Use Cases

### 2.1 Target Users
- Visitors landing on the platform for the first time who need an overview before signing up
- Internal company staff accessing the system via login credentials
- Admin users responsible for user management, full system access, and subscription/transaction monitoring
- Regular users performing day-to-day work order management, billing, purchasing, expenses tracking, stock operations, delivery challan creation (Premium), work logging, subscription management, payment email automation (Premium), and custom color theme personalization

### 2.2 Core Use Cases
- Visitor lands on the Landing Page, views the app title, description, and visual mockups, and proceeds to Sign Up or Log In
- Visitor clicks 「Sign Up」 on the Landing Page and is taken to the Registration Page
- Visitor clicks 「Log In」 on the Landing Page and is taken to the Login Page
- New user registers with First Name, Last Name, and Email; a verification code is sent to the registered email; the user enters the code on the verification page to activate their account; only after verification can the user log in; the user must accept Terms & Conditions and Privacy Policy via checkbox before submitting the registration form
- User logs in using Email and OTP sent to their registered email address
- User uses Forgot Password or Forgot Email ID on the Login Page; a reset link is sent to their registered email; clicking the link opens a reset page where the user sets a new password or new email ID, which is updated in the backend
- Admin logs in for the first time and a welcome email is sent to the admin's registered email address
- Admin sets up company details and manages users
- Admin monitors all user subscriptions, payment history, and transaction records
- Users create work orders by entering Customer Name, Job Name, Quantity, Rate, and Status; the work order is saved and immediately visible in the Work Order List
- Work orders created in the Work Order module automatically appear in the Work Track module with all relevant details (Customer Name, Job Name, Quantity, Rate, pending quantity, status) pre-populated, eliminating manual re-entry
- Users update daily completed quantity in Work Track; pending quantity and status update automatically and in real time in both Work Track and the linked Work Order — for example, if a work order has Total Quantity 500, and Day 1 entry logs 200 completed, the Work Order immediately reflects Completed: 200, Pending: 300; subsequent entries continue to accumulate until Pending reaches 0, at which point Status automatically changes to Completed
- Users create and manage customers and suppliers for quick auto-fill during billing and purchase order creation
- Users create and manage bills and purchase orders within their own data scope
- Users add and manage expense entries (e.g., shop rent, electricity bill) and view expense calculations within the Expenses module — accessible to all logged-in users including Free plan users and Admin
- Premium users create and manage delivery challans for job work, returns, repairs, samples, and branch transfers
- Free plan users who attempt to access the Delivery Challan module are shown a locked state with an upgrade prompt; no challan creation is permitted until an active Premium subscription is confirmed
- Users track payment status of issued bills and set payment reminder schedules
- Premium users receive automated payment reminder emails and payment confirmation emails
- Users log daily outsource and in-house work, machine running hours, and job completion details
- Users monitor stock levels and receive low-stock alerts via dashboard
- Users generate sales, purchase, and expense reports with graphical analytics
- Users export billing and purchase order records by date range for GST return filing
- Users recover forgotten passwords or email IDs via the Forgot Password and Forgot Email ID options on the Login Page
- Admin views all registered/logged-in users and manages user accounts without accessing their business data
- Users submit help or support requests via a help form
- Free plan users see watermarks on printed documents; Premium users have watermark-free prints
- Users upgrade to Premium via the subscription page using Razorpay (card, UPI, QR code); a Refund Policy checkbox acknowledgement is required before payment
- Users entering Company Settings must acknowledge the Data Security Policy via checkbox
- Users interact with the AI Assistant chat popup for quick support
- Users toggle between light and dark themes using the dark mode toggle; the selected theme preference is persisted across sessions and applied consistently across all pages
- Users create, customize, and save custom color themes using the Theme Builder, defining their own primary, secondary, and accent colors to personalize the BusinessPlus interface

---

## 3. Page Structure and Core Features

### 3.1 Page Overview

```
BusinessPlus
├── Landing Page
│   ├── Hero Section (Full-width, centered branding)
│   ├── Features Section
│   ├── Pricing Preview Section
│   ├── Call-to-Action Section
│   └── Footer
├── Registration Page (with Terms & Conditions + Privacy Policy checkbox)
├── Email Verification Page (enter verification code)
├── Login Page (Email + OTP)
│   ├── Forgot Password
│   └── Forgot Email ID
├── Reset Password Page
├── Reset Email ID Page
├── Company Setup / Settings Page (with Data Security Policy checkbox)
├── Dashboard
│   └── Upgrade to Premium Button (visible to Free plan users)
├── Subscription Page
│   ├── Plan Comparison (Free vs Premium)
│   └── Payment Flow (Razorpay, with Refund Policy checkbox)
├── Work Order Module
│   ├── Work Order List
│   └── Create / View / Edit Work Order
├── Billing Module
│   ├── Bill List (with Export)
│   └── Create / View Bill (A4 Print-Ready, 4 Design Templates)
├── Purchase Order Module
│   ├── PO List (with Export)
│   └── Create / View PO (A4 Print-Ready)
├── Expenses Module (accessible to all logged-in users — Free, Premium, and Admin)
│   ├── Expenses List
│   └── Add / Edit Expense Entry
├── Delivery Challan Module (Premium only — locked for Free plan users)
│   ├── Delivery Challan List
│   └── Create / View Delivery Challan (A4 Print-Ready)
├── Stock Module
│   ├── Stock List
│   └── Stock Detail
├── Customer Module
│   ├── Customer List
│   └── Create / Edit Customer
├── Supplier Module
│   ├── Supplier List
│   └── Create / Edit Supplier
├── Reports Module
│   ├── Daily Report
│   ├── Weekly Report
│   ├── Yearly Report
│   └── Custom Date Range Report
├── Daily Work Log Module (Work Track)
│   ├── Work Log List
│   └── Create / View Work Log Entry
├── User Management (Admin only)
│   ├── User List (with Subscription Status)
│   ├── Create / Edit / Remove User
│   └── Transaction / Payment History Panel
├── Theme Builder (post-login, accessible via Settings or dedicated menu item)
│   ├── Theme List (saved custom themes)
│   └── Create / Edit Custom Theme
├── Help / Support (bottom of menu)
│   └── Help Form
├── AI Assistant (floating icon, bottom-right)
├── Privacy Policy Page
├── Terms & Conditions Page
├── Refund Policy Page
└── Data Security Policy Page
```

---

### 3.2 Landing Page

- The Landing Page is the first page a visitor sees when opening the BusinessPlus domain
- Visitors are not redirected to the Login or Registration page directly; the Landing Page is the default entry point
- The Landing Page uses a modern, full-page scrollable layout with distinct sections stacked vertically
- The dark mode toggle is accessible on the Landing Page; toggling it switches the entire page between light and dark themes

#### Hero Section (Full-Width, Centered)
- Occupies the full viewport height on initial load
- Displays the application title 「BusinessPlus」 as a large, bold, centered heading
- Below the heading, a concise and compelling tagline describing what BusinessPlus offers is displayed
- Two prominent call-to-action buttons are displayed side by side, centered below the tagline:
  - 「Get Started Free」 — navigates to the Registration Page
  - 「Log In」 — navigates to the Login Page
- A high-quality hero illustration or animated graphic representing business operations, billing, or productivity is displayed below or alongside the text
- Smooth entrance animations are applied to the heading, tagline, buttons, and illustration on page load
- Background uses a gradient or subtle pattern consistent with the Orange color theme in light mode; adapts appropriately in dark mode

#### Features Section
- Displayed below the Hero Section upon scrolling
- Section heading: 「Everything You Need to Run Your Business」
- Displays a grid of feature cards (3 or 4 columns on desktop, 1–2 columns on mobile)
- Each feature card includes:
  - An icon representing the feature
  - A short feature title (e.g., Work Orders, GST Billing, Purchase Orders, Expense Tracking, Delivery Challans, Stock Management, Reports & Analytics)
  - A one-line description of the feature
- Cards use subtle hover effects and consistent spacing

#### Pricing Preview Section
- Displayed below the Features Section
- Section heading: 「Simple, Transparent Pricing」
- Displays two plan cards side by side: Free Plan and Premium Plan
- Free Plan card:
  - Label: 「Free」
  - Price: 「₹0 / month」
  - Lists key inclusions and limitations (e.g., watermark on prints, no Delivery Challan, no Payment Email Automation)
  - A 「Get Started Free」 button navigating to the Registration Page
- Premium Plan card:
  - Label: 「Premium」 with a highlighted/badge style
  - Price: 「₹499 / month」 or 「₹5499 / year」
  - Lists all Premium features (no watermark, Delivery Challan, Payment Email Automation, full access)
  - A 「Upgrade to Premium」 button navigating to the Registration Page or Subscription Page
- The Premium card is visually emphasized (e.g., border highlight, shadow, or badge)

#### Call-to-Action Section
- Displayed below the Pricing Preview Section
- A full-width banner with a bold heading such as 「Start Managing Your Business Smarter Today」
- A single 「Sign Up for Free」 button centered below the heading, navigating to the Registration Page
- Background uses the Orange color theme accent

#### Footer
- Displayed at the bottom of the Landing Page
- Footer link format: Privacy Policy | Terms & Conditions | Refund Policy | Data Security Policy
- Each link opens the corresponding standalone policy page

#### General Landing Page Rules
- The page uses the Orange color theme consistent with the rest of the application
- The design is modern, professional, and premium in appearance
- Smooth scroll behavior is applied between sections
- The page is fully mobile responsive; all sections adapt gracefully to smaller screen sizes
- Authenticated users visiting the Landing Page are redirected directly to the Dashboard
- Dark mode is fully supported on the Landing Page; all sections, backgrounds, text, cards, and buttons adapt correctly to the active theme

---

### 3.3 Registration Page

- New users access the Registration Page to create an account
- Registration fields:
  - First Name
  - Last Name
  - Email Address
- **Policy Checkbox at Registration:**
  - A mandatory checkbox is displayed before the Create Account button
  - Checkbox label: 「I have read and agree to the Terms & Conditions and Privacy Policy」
  - The words 「Terms & Conditions」 and 「Privacy Policy」 are clickable links that open the respective policy pages
  - The form cannot be submitted unless this checkbox is checked
- The registration button is labeled 「Create Account」
- Upon successful form submission, the account is created in a pending/unverified state — the account is NOT activated immediately
- A verification code is automatically sent to the registered email address upon successful form submission
- The user is redirected to the Email Verification Page after submitting the registration form
- New users are assigned the Free plan by default upon account activation
- The page fully supports dark mode; all form elements, labels, inputs, and backgrounds adapt to the active theme

#### Email Sender Configuration
- All outgoing emails from the application are sent using a configured sender email address
- The sender email address must be set in the application's backend environment configuration using the following environment variable:
  - SENDER_EMAIL — the email address used as the From address for all outgoing emails
- Additional email service configuration variables (e.g., SMTP host, port, username, password, or API key) must also be set in the backend environment configuration alongside SENDER_EMAIL
- These values must be stored securely and not hardcoded in the source code

#### Razorpay API Configuration
- The Razorpay API Key ID and API Key Secret must be entered in the application's backend environment configuration
- Configuration fields required:
  - RAZORPAY_KEY_ID — used on both frontend and backend
  - RAZORPAY_KEY_SECRET — used on backend only; never exposed to the frontend
- These values must be stored securely and not hardcoded in the source code

---

### 3.4 Email Verification Page

- Displayed immediately after the user submits the registration form
- The page informs the user that a verification code has been sent to their registered email address
- The user enters the verification code in an input field on this page
- A 「Verify」 button submits the entered code for validation
- Upon successful code verification:
  - The account is activated
  - The user is redirected to the Login Page with a success message
  - A welcome email is automatically sent to the registered email address
- If the verification code is incorrect, an inline error message is displayed and the user may re-enter the code
- If the verification code has expired, an inline error message is displayed and a resend option is provided
- A resend verification code option is available on this page
- Resend requests are subject to a short cooldown period (e.g., 60 seconds) between requests to prevent abuse
- The verification code expires after 10 minutes; after expiry, the user must request a new code
- Until the code is verified, the user cannot log in; if a login attempt is made with an unverified account, an appropriate message is displayed and the user is directed to the verification page
- The page fully supports dark mode

---

### 3.5 Login Page

- Login fields:
  - Email Address
  - OTP (One-Time Password sent to the registered email)
- Login flow:
  1. User enters their registered Email Address and clicks 「Send OTP」 (or equivalent)
  2. An OTP is sent to the registered email address
  3. User enters the OTP on the login page
  4. Upon successful OTP verification, the user is logged in
- OSS Google login support
- After login, display only the username portion derived from the email (e.g., valoreng), never show the email domain
- Redirect to Company Setup if first-time login; otherwise redirect to Dashboard
- On login, the system checks the user's subscription status and applies the appropriate plan for the session
- OTP expires after 10 minutes; expired OTP prompts user to request a new one
- **Unverified Account Login Attempt:**
  - Login is denied; message displayed: 「Please verify your email address before logging in. Check your inbox for the verification code.」
  - The user is directed to the Email Verification Page
- **First-Time Admin Login Welcome Email:**
  - When the first Admin user logs in for the very first time, a welcome email is automatically sent to the admin's registered email address
- The page fully supports dark mode

#### Forgot Password (on Login Page)
- A 「Forgot Password」 link is displayed on the Login Page
- Clicking 「Forgot Password」 triggers a reset email to the user's registered email address
- The reset email contains a unique, time-limited, single-use link
- Clicking the link in the email opens the Reset Password Page
- On the Reset Password Page, the user enters and confirms a new password; successful submission updates the password in the backend and redirects to the Login Page
- If the reset link has expired or is invalid, an appropriate error message is displayed on the Reset Password Page
- Reset links are single-use; once used, the link is invalidated

#### Forgot Email ID (on Login Page)
- A 「Forgot Email ID」 link is displayed on the Login Page
- Clicking 「Forgot Email ID」 triggers a reset email to the user's registered email address
- The reset email contains a unique, time-limited, single-use link
- Clicking the link in the email opens the Reset Email ID Page
- On the Reset Email ID Page, the user enters and confirms a new email ID; successful submission updates the email ID in the backend and redirects to the Login Page
- If the reset link has expired or is invalid, an appropriate error message is displayed on the Reset Email ID Page
- Reset links are single-use; once used, the link is invalidated

---

### 3.6 Reset Password Page

- Accessible only via the reset link sent to the user's registered email address after clicking 「Forgot Password」 on the Login Page
- The page displays a form with the following fields:
  - New Password
  - Confirm New Password
- A 「Reset Password」 button submits the form
- Upon successful submission, the new password is updated in the backend
- A success confirmation message is displayed and the user is redirected to the Login Page
- If the reset link has expired or is invalid, an appropriate error message is displayed
- Password confirmation mismatch displays an inline validation error
- The page fully supports dark mode

---

### 3.7 Reset Email ID Page

- Accessible only via the reset link sent to the user's registered email address after clicking 「Forgot Email ID」 on the Login Page
- The page displays a form with the following fields:
  - New Email ID
  - Confirm New Email ID
- A 「Update Email ID」 button submits the form
- Upon successful submission, the new email ID is updated in the backend
- A success confirmation message is displayed and the user is redirected to the Login Page
- If the reset link has expired or is invalid, an appropriate error message is displayed
- Email confirmation mismatch displays an inline validation error
- The page fully supports dark mode

---

### 3.8 Company Setup / Settings Page

- Accessible only on first login or via Settings
- Fields:
  - Company Name
  - GST Number (optional; entered manually; no auto-fetch; see GST Fetching System below)
  - Address
  - Contact Details (phone, email)
  - Company Logo (image upload)
  - Website (optional; if provided, the website domain is displayed on printed/downloaded bills and purchase orders)
  - Bank Details (optional; if provided, bank details are included in payment request emails)
    - Bank Name
    - Account Number
    - IFSC Code
    - Account Holder Name
- **Data Security Policy Checkbox:**
  - A mandatory checkbox is displayed before the Save/Submit button
  - Checkbox label: 「I have read and agree to the Data Security Policy」
  - The words 「Data Security Policy」 are a clickable link that opens the Data Security Policy page
  - The form cannot be saved unless this checkbox is checked
  - On subsequent visits to the Settings page, the checkbox must be re-acknowledged before saving any changes
- Each user's company settings are stored independently and are not visible to other users
- The page fully supports dark mode

#### GST Number — Optional Field and GST Fetching System

**Field Behaviour**
- The GST Number field in Company Setup is optional; the form can be saved without entering a GST Number
- If the GST Number field is left blank, no fetching is triggered and no error is shown
- If a GST Number is entered, the GST Fetching System is activated as described below

**GST Fetching System — Overview**
- When the user enters a valid GST Number in the Company Setup form, the system automatically attempts to fetch and populate the following company details from the GST data source:
  - Company / Business Name
  - Registered Address
  - Mobile Number (if available in the GST record)
  - Email Address (if available in the GST record)
- The fetched details are populated into the corresponding form fields automatically
- All auto-populated fields remain fully editable by the user before saving
- If the GST Number entered is invalid or no data is found, the form fields remain empty and an inline message is displayed (e.g., 「GST details not found. Please enter details manually.」)

**GST Fetching System — Implementation Guideline**
- The GST Fetching System must be implemented using a GST verification / lookup API
- Recommended approach: integrate with a third-party GST verification API (such as the GST Suvidha Provider network, RazorpayX GST API, Masters India GST API, or any equivalent verified GST data provider)
- The API call is triggered automatically when the user finishes entering the GST Number (e.g., on field blur or after the full 15-character GSTIN is entered)
- The API request must be made from the backend to protect any API keys; the frontend sends the GST Number to the backend endpoint, which calls the external GST API and returns the structured response
- Required backend environment variable:
  - GST_API_KEY — the API key for the chosen GST verification provider; must be stored securely in the backend environment configuration and never hardcoded or exposed to the frontend
- The backend endpoint receives the GSTIN, calls the external GST API using GST_API_KEY, parses the response, and returns the following fields to the frontend:
  - businessName
  - registeredAddress
  - mobileNumber (if available)
  - emailAddress (if available)
- If the external GST API is unavailable or returns an error, the system fails gracefully: the form fields remain editable and the user is shown an inline message (e.g., 「Unable to fetch GST details at this time. Please enter details manually.」)
- GST Number format validation (15-character alphanumeric GSTIN format) must be performed on the frontend before triggering the API call; invalid format should display an inline error without making an API request

---

### 3.9 Dashboard

- Displays data scoped exclusively to the logged-in user
- Summary cards:
  - Total Work Orders
  - Total Bills
  - Total Purchase Orders
  - Total Delivery Challans
  - Total Stock Items
  - Low Stock Items (items below defined threshold)
  - Pending Payments (count of bills with Pending payment status)
  - Total Expenses (sum of all expense amounts for the current month)
- Recent Work Orders table (latest 5–10 entries)
- Recent Bills table (latest 5–10 entries) — includes Payment Status column
- Recent Purchase Orders table (latest 5–10 entries)
- Dashboard data updates automatically based on the user's own records
- Color theme: Orange (or the user's active custom theme if one is applied)
- The Dashboard fully supports dark mode; all cards, tables, and UI elements adapt to the active theme
- **Upgrade to Premium Button:**
  - Displayed prominently on the Dashboard for Free plan users (e.g., as a banner or card)
  - Also displayed in the top-right header area for Free plan users
  - The button is labeled 「Upgrade to Premium」
  - The button is NOT placed inside the navigation menu tab
  - When clicked, opens the Subscription Page
  - The button is hidden for Admin users and for users who already have an active Premium subscription

---

### 3.10 Subscription Page

- Accessible by clicking the 「Upgrade to Premium」 button
- Displays a side-by-side comparison of Free Plan and Premium Plan
- Plan comparison table includes:
  - Watermark on prints: Free = Yes (「BusinessPlus Free Version」); Premium = No
  - Full feature access: Free = Limited; Premium = Full
  - Clean print documents: Free = No; Premium = Yes
  - Delivery Challan: Free = No; Premium = Yes
  - Payment Email Automation: Free = No; Premium = Yes
- Pricing section:
  - Monthly Plan: ₹499 per month
  - Yearly Plan: ₹5499 per year
- User selects either Monthly or Yearly plan
- **Refund Policy Checkbox at Payment:**
  - A mandatory checkbox is displayed before the 「Subscribe Now」 button
  - Checkbox label: 「I have read and agree to the Refund Policy」
  - The words 「Refund Policy」 are a clickable link that opens the Refund Policy page
  - The 「Subscribe Now」 button is disabled until this checkbox is checked
- A 「Subscribe Now」 button initiates the payment flow via Razorpay
- After successful payment, subscription is activated immediately and the page confirms activation
- The page fully supports dark mode

#### Payment Flow
1. User selects a plan and checks the Refund Policy checkbox
2. User clicks 「Subscribe Now」 on the Subscription Page
3. Razorpay payment gateway opens (initialised using RAZORPAY_KEY_ID)
4. User completes payment using one of the supported methods:
  - Card Payment
  - UPI Payment (Google Pay, PhonePe, Paytm, BHIM)
  - QR Code Payment
5. Razorpay webhook verifies the payment server-side using RAZORPAY_KEY_SECRET
6. Upon successful verification:
  - A Transaction ID is generated (e.g., LYRB000234)
  - Subscription is activated immediately
  - Subscription start date and expiry date are recorded
  - Watermark is removed from all print outputs for the user
  - Software features are fully unlocked
7. User sees a success confirmation on screen

---

### 3.11 Work Order Module

- The Work Order tab is positioned in the navigation immediately before the Billing tab
- Accessible to all logged-in users regardless of subscription plan
- The module fully supports dark mode

#### Work Order List
- Displays all work orders belonging to the logged-in user
- Columns: Work Order No (auto-generated), Customer Name, Job Name, Quantity, Rate (₹ per piece), Completed Quantity, Pending Quantity, Work Start Date, Completion Date, Status, Actions
- **Completed Quantity** is aggregated automatically in real time from all linked Work Track entries
- **Pending Quantity** is calculated automatically in real time: Pending Quantity = Quantity − Completed Quantity
- **Status** is derived automatically and updated in real time based on completion:
  - If no Work Track entries are linked → Status = Pending
  - If at least one Work Track entry is linked and Pending Quantity > 0 → Status = In Progress
  - If Pending Quantity = 0 → Status = Completed
- Actions: View, Edit, Delete
- Work order records are scoped to the logged-in user and not visible to other users

#### Create / View / Edit Work Order

**Work Order Details Fields**
- Work Order No (auto-generated, unique per user)
- Customer Name — name of the customer for whom the work is assigned (text input; required)
- Job Name — name or description of the job to be performed (text input; required)
- Quantity — total quantity of items or units ordered (numeric; required)
- Rate — rate per piece in ₹ (numeric; required)
- Work Start Date — date when the work began (date picker; required)
- Completion Date — date when the work was completed (date picker; optional; can be filled once work is complete)
- Completed Quantity — automatically aggregated in real time from all linked Work Track entries; displayed as a read-only field; updates immediately whenever a linked Work Track entry is saved, updated, or deleted
- Pending Quantity — automatically calculated in real time as Quantity minus Completed Quantity; displayed as a read-only field; updates immediately whenever Completed Quantity changes
- Status — automatically derived and updated in real time:
  - Pending: no Work Track entries are linked
  - In Progress: at least one Work Track entry is linked and Pending Quantity > 0
  - Completed: Pending Quantity = 0 (i.e., total completed across all linked Work Track entries equals the original Quantity)
  - Displayed as a read-only field

**Real-Time Work Order Update Behaviour**
- Every time a Work Track entry linked to this Work Order is created, updated, or deleted, the Work Order's Completed Quantity, Pending Quantity, and Status are recalculated and persisted immediately without requiring a manual refresh
- Example flow:
  - Work Order created: Total Quantity = 500, Completed = 0, Pending = 500, Status = Pending
  - Day 1 Work Track entry saved: Completed Quantity = 200 → Work Order updates to Completed = 200, Pending = 300, Status = In Progress
  - Day 2 Work Track entry saved: Completed Quantity = 150 → Work Order updates to Completed = 350, Pending = 150, Status = In Progress
  - Day 3 Work Track entry saved: Completed Quantity = 150 → Work Order updates to Completed = 500, Pending = 0, Status = Completed
- This recalculation is triggered server-side on every save or update of a linked Work Track entry; the updated values are reflected on the Work Order List and Work Order detail view immediately

**Auto-Population in Work Track**
- When a new work order is created and saved, it automatically becomes available in the Work Track module
- When a user creates a new Work Track entry and selects a Work Order via the Work Order Link field, the following details from the linked work order are automatically pre-populated in the Work Track entry form:
  - Customer Name
  - Job Name
  - Total Quantity
  - Rate
  - Current Pending Quantity (calculated at the time of Work Track entry creation)
- These pre-populated fields are read-only in the Work Track entry form and serve as reference information
- The user enters the Completed Quantity for that day's work in the Work Track entry

**Work Track Summary on Work Order View**
- The Work Order view displays a dedicated section labeled Work Track Summary
- This section shows the following data aggregated from all linked Work Track entries:
  - Total Completed Quantity — sum of all completed quantities entered across all linked Work Track entries
  - Pending Quantity — Quantity minus Total Completed Quantity
  - Number of Work Track entries linked to this work order
- Updates made in the Work Track module to entries linked to a work order are automatically reflected in the Work Track Summary without requiring a manual refresh
- Only Work Track entries explicitly linked to this Work Order contribute to the Work Track Summary

**Validation Rules**
- Customer Name, Job Name, Quantity, Rate, and Work Start Date are required fields; the work order cannot be saved without these
- Quantity must be a positive numeric value; zero or negative values are not permitted
- Rate must be a positive numeric value; zero or negative values are not permitted
- Completed Quantity and Pending Quantity are always read-only and auto-calculated; they cannot be manually edited on the Work Order form
- Total Completed Quantity across all linked Work Track entries cannot exceed the original Quantity; an inline validation error is displayed in Work Track if this condition would be violated

---

### 3.12 Billing Module

#### Bill List
- Displays all bills belonging to the logged-in user
- Columns: Bill No, Date, Customer Name, Total Amount, GST Amount, Payment Status, Payment Reminder, Actions
- **Payment Status Dropdown** (inline in the Bill List table):
  - Values: Paid / Unpaid
  - Default value: Unpaid
  - When changed to Paid, a payment confirmation email is automatically sent to the customer (Premium users only)
- **Payment Reminder Dropdown** (inline in the Bill List table, Premium users only):
  - Values: None / 7 Days / 30 Days / 45 Days / 90 Days
  - Default value: None
  - If None is selected, no reminder email is sent
  - If any day option is selected, a payment reminder email is scheduled and sent to the customer after the specified number of days from the bill date
- Actions: View, Print/Download, Update Payment Status
- **Export Button** available on the Bill List page
- The module fully supports dark mode

#### Payment Email Automation (Premium Only)

**Payment Request / Reminder Email (sent when a reminder day option is selected)**
- Triggered automatically after the specified number of days from the bill date
- Email is formal and professional in tone (polite and request-based)
- Must include:
  - Customer Name
  - Invoice Number
  - Amount Due
  - Bill attachment (PDF of the bill)
  - Payment Instructions: if the user has entered bank details in Company Setup, the bank details (Bank Name, Account Number, IFSC Code, Account Holder Name) are included; if no bank details are provided, the payment instructions section is omitted
- Sent to the customer's email address as recorded in the bill

**Payment Confirmation Email (sent automatically when Payment Status is changed to Paid)**
- Triggered automatically when the user changes the Payment Status dropdown to Paid
- Email is professional and appreciative in tone
- Must include:
  - Thank You message
  - Payment confirmation details (Invoice Number, Amount, Payment Date)
- Sent to the customer's email address as recorded in the bill

#### Create Bill — Page Theme and UI
- The Bill creation and view page must use a modern, clean, and professional UI design
- The layout should feature a well-structured form with clear section groupings, readable typography, and a polished appearance consistent with the active color theme
- No terms and conditions text of any kind is displayed on the bill creation page or on any printed/downloaded bill document
- The page fully supports dark mode

#### Create Bill — Fields
- **Bill To (Customer Selection):**
  - A dropdown field labeled Bill To is displayed at the top of the bill form
  - The dropdown lists all saved customers belonging to the logged-in user
  - Upon selecting a customer, the following fields are automatically populated: Company Name, GST Number, Address, Contact Details
  - The auto-filled customer details are editable by the user before saving the bill
  - An inline option (e.g., + Add New Customer) is available within the dropdown to add a new customer directly from the bill creation page without navigating away
- **P.O No (Purchase Order Number) — Optional Field:**
  - A radio button labeled P.O No is displayed on the bill creation form
  - By default, the P.O No radio button is unselected and the P.O No input field is hidden
  - When the user selects the P.O No radio button, a manual text input field for P.O No becomes visible
  - P.O No is an optional field; the bill can be saved with or without it
- Fields per line item:
  - Item Name
  - HSN / SSN Code
  - Quantity
  - Unit Price
  - CGST (default 9%)
  - SGST (default 9%)
  - Line Total (auto-calculated)
- Bill summary:
  - Subtotal
  - Total CGST
  - Total SGST
  - Grand Total
- Below the Grand Total, a horizontal line is displayed followed by the text: Authorised Signature
- No computer-generated disclaimer text is shown anywhere on the bill
- Bill No is auto-generated and unique per user

#### Bill Design Templates
- The Bill View and Print layout supports 4 selectable design templates:
  - **Blue Theme** — professional blue color scheme
  - **Orange Theme** — consistent with the application's primary Orange color theme
  - **Gray Theme** — neutral gray color scheme
  - **Purple Theme** — modern purple color scheme
- Each template uses a modern, clean, visually attractive, and professional branding-friendly design
- The user can select a template before printing or downloading the bill
- All four templates render the same bill content and data; only the visual styling (colors, header style, accent elements) differs between templates
- All templates are print-ready and suitable for PDF export

#### Bill Print / Download Layout (A4)
- The printed or downloaded bill must be rendered in proper A4 size with clean professional alignment, proper margins and spacing, and a one-click Print functionality
- The bill layout follows a minimalist corporate invoice design inspired by the reference image provided (file-agkxid2fixa8.jpg)
- Reference image: minimalist-corporate-billing-format-professional-corporate-invoice-template-business-invoice-layout-vector.jpg, URL: https://miaoda-conversation-file.s3cdn.medo.dev/user-aexavt09qdj4/conv-aexewhy21fr4/20260323/file-agkxid2fixa8.jpg
- The bill document must be rendered as three copies on a single page or across a single print/download output, clearly labeled:
  - **ORIGINAL** — first copy
  - **DUPLICATE** — second copy
  - **TRIPLICATE** — third copy
- Each copy is visually identical in content and layout; only the copy label differs
- The copy label must be prominently displayed on each copy (e.g., top-right corner or header area)
- Layout per copy:
  - **Header section:** Company Logo (top), Company Name, GST Number, Address, Contact Details, and Website domain (if provided in Settings)
  - **Bill metadata:** Bill No (auto-generated), Bill Date, P.O No (displayed immediately after Invoice Date, only if P.O No was entered), Customer Name, Customer GST Number, Customer Address, Customer Contact Details
  - **Line-item table:** columns for Item Name, HSN/SSN Code, Quantity, Unit Price, CGST (9%), SGST (9%), Line Total; table rendered with visible borders
  - **Summary section:** Subtotal, Total CGST, Total SGST, Grand Total — right-aligned
  - **Signature section:** horizontal divider line followed by the label Authorised Signature
- If P.O No was not entered, the P.O No field is omitted entirely from the print/download layout; no blank label or placeholder is shown
- No terms and conditions text of any kind must appear on any bill copy
- Payment Status must not appear on any copy under any circumstance
- No computer-generated disclaimer text on any copy
- The three-copy layout must be print-ready and suitable for PDF export
- **Watermark Rules for Bill Print:**
  - Free plan users: a semi-transparent watermark is displayed at the bottom of each bill copy
  - Watermark text line 1: 「BusinessPlus Free Version」
  - Watermark text line 2: 「Bill is created by BusinessPlus」
  - The watermark must NOT be placed in the center of the document; it must appear at the bottom
  - Premium plan users and Admin: no watermark appears on any printed/downloaded bill document

#### Export Feature — Billing
- An Export button is available on the Bill List page
- User selects a date range (From Date – To Date) to filter the bills to be exported
- Export formats:
  - Excel (.xlsx) — primary and required format
  - PDF — optional additional format
- Exported data columns: Bill No, Date, Customer Name, Total Amount, GST Amount (CGST + SGST breakdown), Grand Total, Payment Status
- The export file is downloaded directly to the user's device

---

### 3.13 Purchase Order Module

#### PO List
- Displays all purchase orders belonging to the logged-in user
- Columns: PO No, Date, Supplier Name, Total Amount, Actions
- Actions: View, Print/Download
- **Export Button** available on the PO List page
- The module fully supports dark mode

#### Create Purchase Order
- **Supplier Selection:**
  - A dropdown field labeled Supplier is displayed at the top of the PO form
  - The dropdown lists all saved suppliers belonging to the logged-in user
  - Upon selecting a supplier, the following fields are automatically populated: Supplier Name, GST Number, Address, Contact Number
  - The auto-filled supplier details are editable by the user before saving the PO
  - An inline option (e.g., + Add New Supplier) is available within the dropdown
- Reference numbers:
  - PO No (auto-generated, unique per user)
  - Supplier Invoice No (manually entered by user; optional)
- Line item fields:
  - Item Name
  - HSN / SSN Code
  - Quantity
  - Unit Price
  - CGST (default 9%)
  - SGST (default 9%)
  - Line Total (auto-calculated)
- PO summary:
  - Subtotal
  - Total CGST
  - Total SGST
  - Grand Total

#### PO Print / Download Layout (A4)
- The printed or downloaded Purchase Order must be rendered in proper A4 size with clean professional alignment, proper margins and spacing, and a one-click Print functionality
- **Watermark Rules for PO Print:**
  - Free plan users: a semi-transparent watermark is displayed at the bottom of each PO copy
  - Watermark text line 1: 「BusinessPlus Free Version」
  - Watermark text line 2: 「Purchase Bill is created by BusinessPlus」
  - The watermark must NOT be placed in the center of the document; it must appear at the bottom
  - Premium plan users and Admin: no watermark appears on any printed/downloaded PO document

#### Export Feature — Purchase Orders
- An Export button is available on the PO List page
- User selects a date range (From Date – To Date) to filter the purchase orders to be exported
- Export formats:
  - Excel (.xlsx) — primary and required format
  - PDF — optional additional format
- Exported data columns: PO No, Date, Supplier Name, Supplier Invoice No (if available), Total Amount, GST Amount (CGST + SGST breakdown), Grand Total
- The export file is downloaded directly to the user's device

---

### 3.14 Expenses Module

- **Access:** This module is accessible to ALL logged-in users regardless of subscription plan — Free plan users, Premium plan users, and Admin users all have full access
- The Expenses tab is positioned in the navigation immediately after the Purchase Order tab
- No bill or invoice is generated from this module; it is purely for recording and tracking expense entries
- No subscription restriction applies to this module; it is never locked or hidden for any user type
- The module fully supports dark mode

#### Expenses List
- Displays all expense entries belonging to the logged-in user
- Columns: Date, Expense Category, Description, Amount, Actions
- Actions: Edit, Delete
- A summary section is displayed at the top or bottom of the Expenses List showing:
  - Total Expenses (sum of all expense amounts across all entries)
  - Total Expenses for Current Month (sum of expense amounts for the current calendar month)
- Filterable by date range (From Date – To Date) to view expenses within a specific period
- When a date range filter is applied, a filtered total is displayed showing the sum of expenses within the selected range

#### Add / Edit Expense Entry
- Fields:
  - Date (defaults to today; editable)
  - Expense Category (text input or dropdown; examples: Shop Rent, Electricity Bill, Internet Bill, Salaries, Maintenance, Miscellaneous; user can type a custom category)
  - Description (optional free-text field for additional details)
  - Amount (numeric; required)
- A 「Save」 button saves the entry
- All required fields (Date, Expense Category, Amount) must be completed before the entry can be saved
- Expense entries are scoped to the logged-in user and not visible to other users

#### Expense Calculation Display
- Within the Expenses module, the following calculations are displayed:
  - Total Expenses (all time): sum of all expense entry amounts for the logged-in user
  - Total Expenses (current month): sum of expense amounts for the current calendar month
  - Filtered Total: sum of expense amounts within the user-selected date range filter (displayed when a filter is active)
- These calculations update automatically when entries are added, edited, or deleted

---

### 3.15 Delivery Challan Module (Premium Only — Locked for Free Plan Users)

#### Access Control and Lock Behaviour
- This module is accessible only to users with an active Premium subscription and to Admin users
- The Delivery Challan menu item is visible in the navigation for all logged-in users, but its content is locked for Free plan users
- When a Free plan user navigates to the Delivery Challan module (via menu, URL, or any other route), the following locked state is displayed:
  - The page renders a locked/restricted view — no challan list, no create button, and no challan data are shown
  - A prominent upgrade prompt is displayed with a message such as 「Delivery Challan is available for Premium subscribers only.」 and a button labeled 「Upgrade to Premium」 that redirects to the Subscription Page
- No delivery challan can be created, viewed, or printed by a Free plan user under any circumstance
- Subscription validation for Delivery Challan access is enforced server-side; client-side bypass attempts are rejected
- If a user's Premium subscription expires, the Delivery Challan module reverts to the locked state immediately; any attempt to access it shows the upgrade prompt
- The module fully supports dark mode

#### Delivery Challan List
- Displays all delivery challans belonging to the logged-in user
- Columns: DC No, Date, Party Name, Purpose of Delivery, Actions
- Actions: View, Print/Download

#### Create / View Delivery Challan

**Page Theme and UI**
- Clean and professional UI design consistent with the active color theme
- Layout features clear section groupings, readable typography, and adequate spacing

**Header — User Company Details (auto-populated from Company Setup)**
- Company Name
- Address
- GSTIN
- Phone / Email

**Delivery Challan Details**
- Delivery Challan Number (auto-generated, unique per user)
- Date (defaults to today; editable)
- Place of Supply (text input)

**Consignee / Party Details**
- Party Name
- Address
- GSTIN
- State

**Purpose of Delivery (dropdown — single select)**
- Job Work
- Return after Job Work
- For Repair
- For Sample
- Branch Transfer

**Item Details Table**
- Columns:
  - Sr No (auto-incremented)
  - Item Name
  - Description
  - HSN / SAC
  - Quantity
  - Unit
- Rows can be added or removed dynamically

#### Delivery Challan Print / Download Layout (A4)
- The printed or downloaded Delivery Challan must be rendered in proper A4 size with clean professional alignment, proper margins and spacing, and a one-click Print functionality
- The print layout must match the professional quality and structure of the bill print layout — well-structured sections, visible table borders, clear typography, and consistent spacing throughout
- The document is rendered as **2 copies on a single A4 page**, clearly labeled:
  - **ORIGINAL** — first copy
  - **DUPLICATE** — second copy
- Each copy is visually identical in content and layout; only the copy label differs
- The copy label must be prominently displayed on each copy (e.g., top-right corner or header area)
- Layout per copy:
  - **Header section:** Company Name, Address, GSTIN, Phone / Email
  - **Document metadata:** Delivery Challan Number, Date, Place of Supply
  - **Consignee / Party section:** Party Name, Address, GSTIN, State
  - **Purpose of Delivery:** displayed prominently
  - **Item Details Table:** columns for Sr No, Item Name, Description, HSN / SAC, Quantity, Unit; table rendered with visible borders
  - **Declaration section:** 「Goods sent for Job Work / Return after Job Work and not for sale.」
  - **Signature section:** Prepared By (label with blank space) and Authorised Signatory (label with blank space)
- The two-copy layout must be print-ready and suitable for PDF export
- Each copy must be clearly separated (e.g., by a divider line or adequate spacing) so that both copies fit neatly on a single A4 page
- **Watermark Rules for Delivery Challan Print:**
  - Free plan users: not applicable (Delivery Challan is a Premium-only feature; Free plan users cannot access or print challans)
  - Premium plan users: no watermark appears on any printed/downloaded Delivery Challan document
  - Admin: no watermark

---

### 3.16 Stock Module

#### Stock List
- Displays all stock items belonging to the logged-in user
- Columns: Item Name, HSN / SSN Code, Quantity in Stock, Unit, Actions
- Low stock items are visually highlighted
- Actions: Edit, Delete
- The module fully supports dark mode

#### Stock Detail / Edit
- Fields: Item Name, HSN / SSN Code, Quantity, Unit, Low Stock Threshold
- Stock levels update automatically when bills or purchase orders are created

---

### 3.17 Customer Module

#### Customer List
- Displays all saved customers belonging to the logged-in user
- Columns: Company Name, GST Number, Address, Contact Details, Actions
- Actions: Edit, Delete
- The module fully supports dark mode

#### Create / Edit Customer
- Fields:
  - Company Name
  - GST Number (entered manually; no auto-fetch)
  - Address
  - Contact Details (phone, email)
- Customer records are scoped to the logged-in user and not visible to other users
- Customers can also be created inline from the bill creation page

---

### 3.18 Supplier Module

#### Supplier List
- Displays all saved suppliers belonging to the logged-in user
- Columns: Supplier Name, GST Number, Address, Contact Details, Actions
- Actions: Edit, Delete
- The module fully supports dark mode

#### Create / Edit Supplier
- Fields:
  - Supplier Name
  - GST Number (entered manually; no auto-fetch)
  - Address
  - Contact Details (phone, email)
- Supplier records are scoped to the logged-in user and not visible to other users
- Suppliers can also be created inline from the PO creation page

---

### 3.19 Reports Module

- All reports are scoped to the logged-in user's data only
- Report types:
  - Daily Report
  - Weekly Report
  - Yearly Report
  - Custom Date Range (From Date – To Date)
- Each report displays:
  - Total Sales (from Bills)
  - Total Purchases (from Purchase Orders)
  - Total Expenses (from Expenses Module) — sum of all expense entries within the selected report period
- **Visual Analytics:**
  - Professional dynamic line graph comparing Sales vs Purchases vs Expenses over the selected period
  - Circular charts (partially filled, smooth style) for key metrics (e.g., paid vs unpaid bills ratio, sales distribution, expense breakdown by category)
  - Clean dashboard-style UI with focus on data clarity, visual appeal, and easy understanding
- Data table below the charts showing period-wise breakdown including an Expenses column
- The module fully supports dark mode; all charts, graphs, and tables adapt to the active theme

---

### 3.20 Daily Work Log Module (Work Track)

#### Work Log List
- Displays all daily work log entries belonging to the logged-in user
- Columns: Date, Work Type (Outsource / In-House), Customer Name, Job Name, Completed Quantity, Pending Quantity, Machine Running Hours, Actions
- Actions: View, Edit, Delete
- Filterable by date and work type
- The module fully supports dark mode

#### Create / View Work Log Entry
- Fields:
  - Date (defaults to today)
  - Work Type (dropdown: Outsource / In-House)
  - **Work Order Link (optional):** a dropdown or reference field allowing the user to link this Work Track entry to an existing Work Order by selecting the relevant Work Order No; when a Work Order is selected, the following fields are automatically pre-populated from the linked work order as read-only reference information:
    - Customer Name (pre-populated from the linked Work Order; read-only)
    - Job Name (pre-populated from the linked Work Order; read-only)
    - Total Quantity (pre-populated from the linked Work Order; read-only)
    - Rate (pre-populated from the linked Work Order; read-only)
    - Current Pending Quantity (calculated at the time of entry creation; read-only)
  - Customer Name (editable text input when no Work Order is linked; read-only and pre-populated when a Work Order is linked)
  - Job Name (editable text input when no Work Order is linked; read-only and pre-populated when a Work Order is linked)
  - **Completed Quantity** (numeric; required; the quantity of work completed in this specific Work Track entry)
  - Machine Running Hours (numeric; hours the machine ran out of 24, e.g., 18/24)
  - Notes (optional free-text field)
- **Pending Quantity Display (when a Work Order is linked):**
  - After the user enters the Completed Quantity for this entry, the system displays the updated Pending Quantity in real time: Pending Quantity = Work Order Quantity − (previously completed quantities from all prior linked entries + current entry's Completed Quantity)
  - This is displayed as a read-only informational field on the Work Track entry form
- **Automatic Real-Time Back-Propagation to Work Order:**
  - When a Work Track entry linked to a Work Order is saved or updated, the linked Work Order's Completed Quantity, Pending Quantity, and Status are automatically recalculated and updated in real time without requiring a manual refresh
  - Completed Quantity on the Work Order = sum of Completed Quantity across all linked Work Track entries
  - Pending Quantity on the Work Order = Work Order Quantity − Completed Quantity
  - Status on the Work Order:
    - Pending: no Work Track entries are linked
    - In Progress: at least one Work Track entry is linked and Pending Quantity > 0
    - Completed: Pending Quantity = 0 (total completed equals the original Work Order Quantity)
  - Example: Work Order Quantity = 500; Day 1 entry logs 200 → Work Order immediately shows Completed = 200, Pending = 300, Status = In Progress; Day 2 entry logs 300 → Work Order immediately shows Completed = 500, Pending = 0, Status = Completed
- Multiple entries can be created per day
- Entries are scoped to the logged-in user and not visible to other users
- The Work Track entry can be saved without linking to a Work Order; in that case, Customer Name and Job Name are entered manually and no back-propagation occurs

---

### 3.21 User Management (Admin Only)

- Visible and accessible only to users with the Admin role
- **User List:** displays all users who have registered or logged into the system, including their name, email, role, account status, email verification status, current subscription plan, and subscription expiry date
- **Create User:** fields include First Name, Last Name, email, password, role (Admin / Regular User); Admin-created users are activated immediately without requiring email verification
- **Edit User:** update role or reset password
- **Remove User:** Admin can remove (deactivate or delete) any user from the system
- Admin can view user account details but has strictly no access to any user's business data
- **Transaction / Payment History Panel:**
  - Admin can view all subscription transactions across all users
  - Displayed columns: User ID, Plan Type, Transaction ID, Payment Status, Payment Date, Subscription Start Date, Subscription Expiry Date
  - Admin can filter or search by user or plan type
- The module fully supports dark mode

---

### 3.22 Theme Builder

- Accessible to all logged-in users regardless of subscription plan
- Accessible via the application Settings page or a dedicated Theme Builder menu item in the navigation
- The Theme Builder allows users to create, customize, name, save, and apply custom color themes for the BusinessPlus interface
- Custom themes are stored per user and are not visible to or shared with other users
- The Theme Builder fully supports dark mode; the builder UI itself adapts to the active light/dark theme

#### Theme List
- Displays all custom themes saved by the logged-in user
- Each saved theme entry shows:
  - Theme Name
  - A visual color swatch preview showing the primary, secondary, and accent colors of the theme
  - Actions: Apply, Edit, Delete
- A 「Create New Theme」 button opens the theme creation form
- One theme can be marked as the currently active custom theme
- If no custom theme is active, the default Orange theme is applied

#### Create / Edit Custom Theme
- Fields:
  - Theme Name (required; text input; must be unique per user)
  - Primary Color (required; color picker input)
  - Secondary Color (required; color picker input)
  - Accent Color (required; color picker input)
- A live preview panel is displayed alongside the form, showing how the selected colors will appear on representative UI elements (e.g., buttons, navigation bar, cards, highlights)
- A 「Save Theme」 button saves the theme to the user's saved theme list
- A 「Save and Apply」 button saves the theme and immediately applies it as the active interface theme
- Editing an existing theme updates the saved theme; if the theme being edited is currently active, the interface updates immediately upon saving

#### Custom Theme Application Rules
- When a custom theme is applied, it replaces the default Orange color theme across all post-login pages and components
- The dark mode toggle remains functional when a custom theme is active; dark mode applies the custom theme's color values adapted to dark-mode contrast requirements
- Custom theme preference is persisted in local storage alongside the dark/light mode preference; it is applied on page load before content renders to prevent a flash of the default theme
- Print and PDF export outputs are always rendered using the default light-mode Orange theme regardless of any active custom theme; custom themes do not affect printed or downloaded documents
- The Landing Page and all pre-login pages always use the default Orange theme; custom themes apply only to post-login pages
- If a saved custom theme is deleted while it is active, the interface reverts to the default Orange theme immediately
- Custom theme color values are validated to ensure sufficient contrast for readability; if a color combination fails a basic contrast check, an inline warning is displayed (the user may still save the theme)

---

### 3.23 Help / Support

- The Help tab is displayed at the bottom of the application menu and is accessible to all logged-in users
- The Help page contains a single help form with the following fields:
  - Name (pre-filled with the logged-in user's name; editable)
  - Email (pre-filled with the logged-in user's email; editable)
  - Subject (text input)
  - Message / Query (multi-line text area)
- A Submit button sends the form
- Upon submission, the message content is delivered to the software team via email
- A success confirmation message is displayed to the user after successful submission
- All fields are required; the form cannot be submitted with empty required fields
- The page fully supports dark mode

---

### 3.24 AI Assistant (Chat Feature)

- An AI Assistant icon is displayed as a floating button at the bottom-right corner of the application on all post-login pages
- The icon is always visible and non-intrusive
- On click, a small chat box popup opens
- The chat box allows the user to type questions and receive responses for quick support and interaction
- UI characteristics:
  - Minimal and clean design
  - Fast and responsive
  - Non-intrusive; does not obstruct the main application content
  - Consistent with the active color theme (default Orange or user's active custom theme)
  - Fully supports dark mode; the chat popup adapts to the active theme
- The chat popup can be closed by clicking the icon again or a close button within the popup

---

### 3.25 Policy Pages

Four standalone policy pages are included in the application. Each page is accessible via footer links from all pages (both pre-login and post-login) and via contextual checkbox links at relevant steps. All policy pages fully support dark mode.

#### Privacy Policy Page
- Standalone page describing how user data is collected, stored, and used
- Accessible via footer link labeled 「Privacy Policy」
- Accessible via the checkbox link on the Registration Page

#### Terms & Conditions Page
- Standalone page describing the terms of use for the BusinessPlus platform
- Accessible via footer link labeled 「Terms & Conditions」
- Accessible via the checkbox link on the Registration Page

#### Refund Policy Page
- Standalone page describing the refund terms for subscription payments
- Accessible via footer link labeled 「Refund Policy」
- Accessible via the checkbox link on the Subscription Page before payment

#### Data Security Policy Page
- Standalone page describing how company and business data is secured and protected
- Accessible via footer link labeled 「Data Security Policy」
- Accessible via the checkbox link on the Company Setup / Settings Page

#### Footer Links
- A footer is displayed on all pages (pre-login and post-login), including the Landing Page
- Footer link format: Privacy Policy | Terms & Conditions | Refund Policy | Data Security Policy

---

### 3.26 Dark Mode

#### Dark Mode Toggle
- A dark mode toggle control is displayed in the application header/navigation bar and is accessible on all pages, including the Landing Page, all pre-login pages, and all post-login pages
- The toggle allows users to switch between Light Mode and Dark Mode
- The toggle is always visible and easily accessible regardless of the current page or user role

#### Theme Persistence
- The user's selected theme preference (light or dark) is persisted across sessions
- Persistence is implemented using local storage or an equivalent client-side storage mechanism
- When a user returns to the application in a new session, the previously selected theme is automatically applied on page load before any content is rendered, preventing a flash of the wrong theme
- Theme preference is stored per browser/device; it is not synced across devices or stored in the backend

#### Dark Mode Design Requirements
- All pages and components must fully support both light and dark themes
- In dark mode, the following design principles apply:
  - Background colors shift to dark neutral tones (e.g., dark gray or near-black)
  - Text colors shift to light tones for sufficient contrast and readability
  - Cards, modals, dropdowns, input fields, tables, and all UI surfaces adapt to dark-appropriate color values
  - The active color theme accent (Orange by default, or the user's active custom theme accent) is retained in dark mode for buttons, highlights, active states, and key interactive elements, adjusted as needed for contrast and visual harmony
  - Icons, borders, dividers, and decorative elements adapt appropriately
  - Charts, graphs, and data visualizations in the Reports module adapt to dark mode with appropriate background and label colors
  - The AI Assistant chat popup adapts to dark mode
  - The floating Upgrade to Premium button adapts to dark mode
  - The Theme Builder UI adapts to dark mode
- Print and PDF export outputs are always rendered in light mode regardless of the active theme; dark mode does not affect printed or downloaded documents

#### Scope of Dark Mode
- Dark mode applies to all application pages and components without exception:
  - Landing Page (all sections: Hero, Features, Pricing Preview, Call-to-Action, Footer)
  - All pre-login pages (Registration, Email Verification, Login, Reset Password, Reset Email ID, all Policy Pages)
  - All post-login pages and modules (Dashboard, Work Orders, Billing, Purchase Orders, Expenses, Delivery Challan, Stock, Customer, Supplier, Reports, Daily Work Log, User Management, Help/Support, Subscription, Company Setup/Settings, Theme Builder, AI Assistant popup)
- Print/download outputs (Bills, Purchase Orders, Delivery Challans) are excluded from dark mode rendering and always output in light mode

---

## 4. Business Rules and Logic

### 4.1 Role-Based Access Control

| Module | Admin | Regular User (Free) | Regular User (Premium) |
|---|---|---|---|
| Landing Page | Yes (public) | Yes (public) | Yes (public) |
| Dashboard | Yes | Yes | Yes |
| Work Order | Yes | Yes | Yes |
| Billing | Yes | Yes | Yes |
| Purchase Orders | Yes | Yes | Yes |
| Expenses | Yes | Yes | Yes |
| Delivery Challan | Yes | Locked (upgrade prompt) | Yes |
| Stock | Yes | Yes | Yes |
| Customer | Yes | Yes | Yes |
| Supplier | Yes | Yes | Yes |
| Reports | Yes | Yes | Yes |
| Daily Work Log | Yes | Yes | Yes |
| Payment Email Automation | Yes | No | Yes |
| User Management | Yes | No | No |
| Company Setup / Settings | Yes (own) | Yes (own) | Yes (own) |
| Theme Builder | Yes | Yes | Yes |
| Help / Support | Yes | Yes | Yes |
| Subscription Page | No (not required) | Yes | Yes |
| Policy Pages | Yes | Yes | Yes |
| AI Assistant | Yes | Yes | Yes |
| Dark Mode Toggle | Yes | Yes | Yes |

- User Management tab is hidden from the navigation for non-Admin users
- Subscription Page / Upgrade button is hidden for Admin users
- Delivery Challan module is accessible only to Premium users and Admin; Free plan users see a locked state with an upgrade prompt and cannot create, view, or print any challan
- Payment Email Automation (Payment Reminder Dropdown and automated emails) is accessible only to Premium users and Admin
- **Expenses module is accessible to ALL logged-in users — Free plan users, Premium plan users, and Admin — with no subscription restriction of any kind**
- **Theme Builder is accessible to ALL logged-in users — Free plan users, Premium plan users, and Admin — with no subscription restriction**
- **Work Order module is accessible to ALL logged-in users — Free plan users, Premium plan users, and Admin — with no subscription restriction**
- Dark mode toggle is accessible to all users including unauthenticated visitors on the Landing Page and pre-login pages

### 4.2 Data Isolation
- All records (Work Orders, Bills, Purchase Orders, Expenses, Delivery Challans, Stock, Reports, Company Details, Work Log Entries, Customers, Suppliers, Custom Themes) are strictly scoped to the creating user
- No user can view, edit, or delete another user's data
- Bill No, PO No, DC No, and Work Order No sequences are independent per user
- Admin access to User Management does not grant access to any user's business data

### 4.3 GST Calculation
- Default GST split: CGST 9% + SGST 9% = 18% total
- CGST and SGST are calculated per line item based on unit price × quantity
- Grand Total = Subtotal + Total CGST + Total SGST

### 4.4 GST Entry
- GST Number in Company Setup is optional; the form can be saved without it
- When a GST Number is entered in Company Setup, the GST Fetching System is triggered to auto-populate company details (see Section 3.8)
- GST Number in Customer records, Supplier records, and Purchase Order creation is entered manually by the user
- No external API auto-fetch is performed for GST details in Customer, Supplier, or Purchase Order forms

### 4.5 Stock Auto-Update
- When a Bill is created, stock quantities for the billed items are decremented accordingly
- When a Purchase Order is created, stock quantities for the ordered items are incremented accordingly
- Delivery Challan creation does not trigger any stock quantity update
- Expense entry creation does not trigger any stock quantity update
- Work Order creation does not trigger any stock quantity update

### 4.6 Login Display Rule
- The displayed username is derived by stripping the email domain
- Example: valoreng@miaoda.com → displayed as valoreng

### 4.7 Website Display on Documents
- If the user has entered a website URL in Settings, the domain is displayed in the header section of printed/downloaded bills and purchase orders
- If no website is provided, the field is omitted from the document header without error
- Delivery Challan print layout does not include the website field

### 4.8 Bill Signature Section
- After the Grand Total on every bill copy, a horizontal divider line is rendered
- Below the line, the label Authorised Signature is displayed
- No computer-generated disclaimer or signature waiver text is included anywhere on the bill

### 4.9 Supplier Invoice Number
- The Supplier Invoice No field on the Purchase Order form is optional
- It is used to record the supplier's own invoice reference and is displayed on the PO view and print layout alongside the system-generated PO No

### 4.10 Color Theme
- The application uses an Orange color theme as the default throughout the UI, including the Landing Page, navigation, buttons, highlights, and accent elements
- When a user has an active custom theme, the custom theme's primary, secondary, and accent colors replace the default Orange theme across all post-login pages
- In dark mode, the active theme's accent color is retained for interactive elements, adjusted as needed for contrast
- The Landing Page and all pre-login pages always use the default Orange theme regardless of any active custom theme

### 4.11 Payment Status Rules
- Every newly created bill is automatically assigned a Payment Status of Unpaid
- Payment Status can be updated to Paid by the user at any time from the Bill List via the Payment Status dropdown
- When Payment Status is changed to Paid, a payment confirmation email is automatically triggered (Premium users only)
- Payment Status is an internal system field only; it must not be rendered, printed, or exported on any bill document or any of the three bill copies under any circumstance
- Payment Status is visible in: Bill List table, Bill detail view, and Dashboard summary card (Pending Payments count)
- Payment Status is included in the Excel/PDF export of bills as an internal reference column

### 4.12 Payment Reminder Rules
- The Payment Reminder Dropdown is available in the Bill List for Premium users only
- If None is selected, no reminder email is sent
- If a day option (7 Days / 30 Days / 45 Days / 90 Days) is selected, a payment reminder email is scheduled to be sent to the customer after the specified number of days from the bill date
- If the Payment Status is changed to Paid before the reminder is triggered, the scheduled reminder email is cancelled and a payment confirmation email is sent instead
- Payment reminder emails include a PDF attachment of the bill
- Bank details are included in the payment reminder email only if the user has entered bank details in Company Setup

### 4.13 Daily Work Log Rules
- A work log entry must have a Date, Work Type, Completed Quantity, and Machine Running Hours at minimum
- When a Work Order is linked, Customer Name and Job Name are pre-populated from the Work Order and are read-only
- When no Work Order is linked, Customer Name and Job Name are entered manually
- Machine Running Hours must be a numeric value between 0 and 24
- Multiple entries per day are permitted
- Work log entries are independent of billing and stock modules
- A Work Track entry may optionally be linked to a Work Order; linking is not mandatory
- When a Work Track entry is linked to a Work Order and saved or updated, the linked Work Order's Completed Quantity, Pending Quantity, and Status are automatically recalculated and updated in real time

### 4.14 Login OTP Rules
- Login is performed using Email Address and OTP
- The user enters their registered email address and requests an OTP
- The OTP is sent to the registered email address
- OTP is valid for 10 minutes; after expiry, the user must request a new OTP
- Login is only permitted after successful OTP verification
- Unverified accounts cannot log in; the user is directed to the Email Verification Page

### 4.15 Forgot Password and Forgot Email ID Rules
- Both 「Forgot Password」 and 「Forgot Email ID」 options are displayed on the Login Page
- Clicking either option triggers a reset email to the user's registered email address
- The reset email contains a unique, time-limited link
- Clicking the link in the email opens the corresponding reset page:
  - Forgot Password → Reset Password Page: user enters and confirms a new password; the new password is updated in the backend upon successful submission
  - Forgot Email ID → Reset Email ID Page: user enters and confirms a new email ID; the new email ID is updated in the backend upon successful submission
- After a successful reset, the user is redirected to the Login Page
- If the reset link has expired or is invalid, an appropriate error message is displayed on the reset page
- Reset links are single-use; once used, the link is invalidated

### 4.16 Admin User Management Rules
- Admin can view the full list of users who have registered or logged into the system
- Admin can create, edit, and remove user accounts
- Admin visibility is strictly limited to user account details
- Admin has no access to any user's business data under any circumstance

### 4.17 Three-Copy Bill Rules
- Every bill print/download output must contain exactly three copies: ORIGINAL, DUPLICATE, and TRIPLICATE
- All three copies are generated from the same bill data and are identical in content
- The copy label is the only distinguishing element between the three copies

### 4.18 No Terms and Conditions on Bills
- No terms and conditions text of any kind must appear on any bill copy, on any printed or downloaded bill document, or anywhere within the bill creation or view page

### 4.19 Export Rules
- Export is available in both the Billing module and the Purchase Order module
- User must specify a From Date and To Date before initiating an export
- Only records within the selected date range and belonging to the logged-in user are included
- Excel (.xlsx) is the primary export format; PDF export is an optional additional format
- Export files are downloaded directly to the user's device

### 4.20 Customer Auto-Fill Rules
- When a customer is selected from the Bill To dropdown during bill creation, their Company Name, GST Number, Address, and Contact Details are automatically populated
- Auto-filled fields are editable before the bill is saved
- Customer records are scoped per user

### 4.21 Supplier Auto-Fill Rules
- When a supplier is selected from the Supplier dropdown during PO creation, their Supplier Name, GST Number, Address, and Contact Number are automatically populated
- Auto-filled fields are editable before the PO is saved
- Supplier records are scoped per user

### 4.22 Help / Support Submission Rules
- All required fields (Name, Email, Subject, Message) must be completed before the form can be submitted
- Upon successful submission, the message is sent to the software team via email
- A success confirmation message is displayed to the user after submission

### 4.23 Delivery Challan Rules
- Delivery Challan module is accessible only to Premium users and Admin
- Free plan users who navigate to the Delivery Challan module are shown a locked state with an upgrade prompt; no challan creation, viewing, or printing is permitted
- Subscription validation for Delivery Challan access is enforced server-side; client-side bypass attempts are rejected
- DC No is auto-generated and unique per user; duplicates are not possible
- Delivery Challan creation does not affect stock quantities, billing records, or purchase order records
- Every Delivery Challan print/download output must contain exactly two copies: ORIGINAL and DUPLICATE, rendered on a single A4 page
- The declaration text 「Goods sent for Job Work / Return after Job Work and not for sale.」 must appear on every printed/downloaded Delivery Challan copy
- Purpose of Delivery is a required field; the challan cannot be saved without a selected purpose
- If a user's Premium subscription expires, the Delivery Challan module reverts to the locked state immediately

### 4.24 Subscription Plan Rules
- New users are assigned the Free plan by default upon account activation
- Admin accounts are permanently on full access with no subscription requirement and no watermark
- Free plan users have watermarks on all printed/downloaded documents (Bills, Purchase Orders)
- Free plan users do not have access to Delivery Challan or Payment Email Automation
- Premium plan users have no watermarks on any printed/downloaded documents and have access to all features
- Subscription status is checked on login, on application start, and on every print action
- If a Premium subscription expires, the user's plan reverts to Free; watermarks are re-enabled and Premium-only features are restricted
- Subscription activation is immediate upon successful payment verification via Razorpay webhook
- Subscription plans available:
  - Monthly Plan: ₹499 per month
  - Yearly Plan: ₹5499 per year

### 4.25 Watermark Rules
- Watermark applies to: Sales Bill (all three copies), Purchase Order print (Free plan users only)
- Delivery Challan is a Premium-only feature; watermark does not apply
- Watermark position: bottom of the page (not center)
- Watermark appearance: semi-transparent
- Watermark text per document type:
  - Bill: 「BusinessPlus Free Version」 and 「Bill is created by BusinessPlus」
  - Purchase Order: 「BusinessPlus Free Version」 and 「Purchase Bill is created by BusinessPlus」
- Watermark is applied on every copy within a multi-copy print output
- Watermark is never shown for Admin users or active Premium subscribers
- Print and PDF export outputs always render in light mode; dark mode and custom themes do not affect watermark rendering

### 4.26 Transaction Record Rules
- Each completed payment generates a transaction record containing: User ID, Plan Type, Transaction ID, Payment Status, Payment Date, Subscription Start Date, Subscription Expiry Date
- Transaction IDs follow the format LYRB followed by a sequential number (e.g., LYRB000234)
- Transaction records are stored persistently and accessible to Admin via the User Management panel
- Payment verification is performed server-side via Razorpay webhook before activating any subscription

### 4.27 Upgrade Button Placement Rules
- The 「Upgrade to Premium」 button is displayed in the top-right header area and on the Dashboard page for Free plan users
- The button is NOT placed inside the navigation menu tab
- The button is hidden for Admin users and for users with an active Premium subscription

### 4.28 Subscription Expiry Notification
- 7 days before a Premium subscription expires, the user receives a notification
- Notification message: 「Your subscription will expire soon. Renew now.」
- Notification method: in-app notification and/or email to the user's registered email address

### 4.29 Registration, Email Verification, and Welcome Email Rules
- Upon successful registration form submission (Create Account), the account is created in a pending/unverified state
- A verification code is automatically sent to the user's registered email address upon successful form submission
- The user is redirected to the Email Verification Page where they must enter the verification code
- The verification code expires after 10 minutes; if expired, the user must request a new code
- The user must enter the correct verification code to activate their account; login is not permitted until verification is complete
- Upon successful code verification, the account is activated, the user is redirected to the Login Page with a success message, and a welcome email is sent
- Admin-created users do not require email verification; their accounts are active immediately upon creation
- New users are assigned the Free plan by default upon account activation
- When the first Admin user logs in for the very first time, a welcome email is automatically sent to the admin's registered email address
- All outgoing emails use the sender address configured via the SENDER_EMAIL environment variable

### 4.30 P.O No on Bill Rules
- The P.O No field on the bill creation form is controlled by a radio button
- When the radio button is not selected, the P.O No input field is hidden and no P.O No is stored or displayed
- When the radio button is selected, the P.O No input field becomes visible and the user enters the value manually
- P.O No is an optional field
- If P.O No is entered, it is printed immediately after the Invoice Date on all three copies
- If P.O No is not entered, the P.O No field is completely omitted from the print/download layout with no blank label or placeholder shown

### 4.31 Razorpay API Key Configuration Rules
- RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be stored in the application's backend environment configuration
- RAZORPAY_KEY_ID is used on the frontend to initialise the Razorpay checkout and on the backend for order creation
- RAZORPAY_KEY_SECRET is used exclusively on the backend; it must never be exposed to the frontend

### 4.32 Policy Checkbox Rules
- **Registration Page:** the Terms & Conditions and Privacy Policy checkbox is mandatory; the registration form cannot be submitted without checking this checkbox
- **Subscription Page:** the Refund Policy checkbox is mandatory; the 「Subscribe Now」 button remains disabled until the checkbox is checked
- **Company Setup / Settings Page:** the Data Security Policy checkbox is mandatory; the settings form cannot be saved without checking this checkbox; the checkbox must be re-acknowledged on every save action
- All policy checkbox links open the corresponding policy page without navigating away from the current form

### 4.33 Footer Policy Links Rules
- The footer is displayed on all pages of the application, including the Landing Page and all pre-login and post-login pages
- Footer links are: Privacy Policy | Terms & Conditions | Refund Policy | Data Security Policy
- Each link opens the corresponding standalone policy page

### 4.34 Application Name
- The application name is BusinessPlus throughout the entire system
- All references to the application name in UI labels, watermarks, email communications, page titles, and document headers must use BusinessPlus

### 4.35 Email Sender Configuration Rules
- All outgoing emails are sent using the sender address configured via the SENDER_EMAIL environment variable
- SENDER_EMAIL must be set in the backend environment configuration and must correspond to a verified sender address
- Email service provider connection settings must also be configured in the backend environment
- These values must be stored securely and not hardcoded in the source code
- If SENDER_EMAIL or the email service is not configured, all email-dependent flows will fail; the system must log such failures and surface an appropriate error or fallback message

### 4.36 Bill Design Template Rules
- The user can select from 4 design templates (Blue, Orange, Gray, Purple) when viewing or printing a bill
- The selected template applies to the print/download output only; it does not affect the bill creation form layout
- All templates render the same bill content; only the visual styling differs
- The template selection is available on the Bill View / Print page
- If no template is selected, the Orange Theme is applied by default

### 4.37 Bank Details in Payment Emails
- Bank details are included in payment request/reminder emails only if the user has entered bank details in Company Setup
- If no bank details are provided in Company Setup, the payment instructions section is omitted from the email
- Bank details are never displayed on printed or downloaded bill documents

### 4.38 AI Assistant Rules
- The AI Assistant floating icon is visible on all post-login pages
- The chat popup opens on click and can be closed by the user
- The AI Assistant is available to all logged-in users regardless of subscription plan

### 4.39 GST Number in Company Setup Rules
- The GST Number field in Company Setup is optional; the form can be saved without entering a GST Number
- When a valid 15-character GSTIN is entered, the GST Fetching System is triggered automatically (on field blur or after full entry)
- The GST Fetching System calls an external GST verification API via the backend using the GST_API_KEY environment variable
- The fetched fields (Company/Business Name, Registered Address, Mobile Number, Email Address) are auto-populated into the corresponding form fields
- All auto-populated fields remain fully editable before saving
- If the GSTIN is invalid in format, an inline validation error is shown and no API call is made
- If the API returns no data or is unavailable, the form fields remain editable and an inline message is shown
- GST_API_KEY must be stored securely in the backend environment configuration and never exposed to the frontend

### 4.40 Landing Page Entry Point Rules
- The Landing Page is the default entry point for all visitors accessing the BusinessPlus domain
- Unauthenticated visitors are always directed to the Landing Page first; they are not redirected directly to the Login or Registration page
- Authenticated users who are already logged in are redirected directly to the Dashboard, bypassing the Landing Page
- The Landing Page is publicly accessible without authentication

### 4.41 Reset Password and Reset Email ID Rules
- Reset links sent via email are unique, time-limited, and single-use
- Once a reset link is used successfully, it is invalidated and cannot be reused
- If a reset link has expired, the user must initiate the forgot password or forgot email ID flow again from the Login Page
- New password and new email ID updates are applied immediately in the backend upon successful form submission on the respective reset pages
- After a successful reset, the user is redirected to the Login Page

### 4.42 Expenses Module Rules
- **The Expenses module is accessible to ALL logged-in users — Free plan users, Premium plan users, and Admin — with no subscription restriction**
- Expense entries are scoped strictly to the logged-in user; no other user can view, edit, or delete another user's expense entries
- No bill, invoice, or printable document is generated from the Expenses module
- Required fields for an expense entry are: Date, Expense Category, and Amount; Description is optional
- Amount must be a positive numeric value; zero or negative values are not permitted
- Expense entries are included in the Reports module calculations for the corresponding period
- Total Expenses displayed within the Expenses module and in Reports are calculated from the logged-in user's expense entries only
- Expense data is included in the Reports module alongside Sales and Purchases data
- The Expenses tab is always visible and accessible in the navigation for all logged-in users regardless of subscription plan
- Admin users also have full access to the Expenses module to record and manage their own expense entries

### 4.43 Dark Mode Rules
- The dark mode toggle is accessible on all pages including the Landing Page and all pre-login and post-login pages
- The user's theme preference is persisted in local storage and automatically applied on page load
- Theme preference is stored per browser/device and is not synced to the backend or across devices
- All pages, components, forms, tables, charts, modals, dropdowns, and UI surfaces must fully support both light and dark themes
- The active theme's accent color is retained in dark mode for interactive elements, adjusted for contrast as needed
- Print and PDF export outputs are always rendered in light mode regardless of the active theme or active custom theme; dark mode and custom themes do not affect any printed or downloaded document
- The dark mode toggle is available to all users including unauthenticated visitors

### 4.44 Custom Theme Rules
- The Theme Builder is accessible to all logged-in users regardless of subscription plan
- Custom themes are scoped strictly to the creating user; no other user can view, access, or apply another user's custom themes
- Each custom theme requires a unique name (per user), a primary color, a secondary color, and an accent color
- A live preview is displayed during theme creation and editing to show how the selected colors appear on representative UI elements
- When a custom theme is applied, it replaces the default Orange theme across all post-login pages and components
- The Landing Page and all pre-login pages always use the default Orange theme; custom themes do not apply to pre-login pages
- Custom theme preference is persisted in local storage alongside the dark/light mode preference and applied on page load before content renders
- If a custom theme is deleted while active, the interface reverts to the default Orange theme immediately
- Print and PDF export outputs always use the default light-mode Orange theme regardless of any active custom theme
- If a color combination in a custom theme fails a basic contrast check, an inline warning is displayed; the user may still save and apply the theme
- If no custom theme is active, the default Orange theme is applied

### 4.45 Work Order and Work Track Integration Rules
- Work Order module is accessible to all logged-in users regardless of subscription plan
- Work Order No is auto-generated and unique per user; duplicates are not possible
- When a new work order is created, it is immediately available for selection in the Work Track module's Work Order Link field
- When a Work Order is selected in a Work Track entry, the following fields are automatically pre-populated from the Work Order as read-only reference data: Customer Name, Job Name, Total Quantity, Rate, and Current Pending Quantity
- The user enters the Completed Quantity for the specific Work Track entry; this represents the quantity completed on that particular day or session
- When a Work Track entry linked to a Work Order is saved or updated, the following fields on the linked Work Order are automatically recalculated and persisted in real time:
  - Completed Quantity = sum of Completed Quantity across all linked Work Track entries
  - Pending Quantity = Work Order Quantity − Completed Quantity
  - Status:
    - Pending: no Work Track entries are linked
    - In Progress: at least one Work Track entry is linked and Pending Quantity > 0
    - Completed: Pending Quantity = 0 (total completed equals the original Work Order Quantity)
- The real-time update is triggered server-side on every save, update, or deletion of a linked Work Track entry; the Work Order List and Work Order detail view reflect the updated values immediately without requiring a manual refresh
- Example:
  - Work Order created with Quantity = 500: Completed = 0, Pending = 500, Status = Pending
  - Day 1: Work Track entry saved with Completed Quantity = 200 → Work Order: Completed = 200, Pending = 300, Status = In Progress
  - Day 2: Work Track entry saved with Completed Quantity = 300 → Work Order: Completed = 500, Pending = 0, Status = Completed
- The total Completed Quantity across all linked Work Track entries cannot exceed the original Work Order Quantity; an inline validation error is displayed in Work Track if this condition would be violated
- Pending Quantity and Completed Quantity on the Work Order are always read-only and auto-calculated; they cannot be manually edited on the Work Order form
- Work Order creation does not affect stock quantities, billing records, or purchase order records
- Work order records are scoped strictly to the logged-in user; no other user can view, edit, or delete another user's work orders
- Only Work Track entries explicitly linked to a Work Order contribute to that Work Order's Completed Quantity, Pending Quantity, and Status calculations
- When a linked Work Track entry is deleted, the Work Order's Completed Quantity, Pending Quantity, and Status are automatically recalculated in real time to reflect the removal

---

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|---|---|
| Duplicate Bill No, PO No, DC No, or Work Order No | System auto-generates unique sequential numbers per user; duplicates are not possible |
| Stock quantity goes below low-stock threshold | Highlight item in Stock List; show count in Dashboard low-stock card |
| Stock quantity reaches zero | Allow bill creation but display a warning that stock is insufficient |
| User attempts to access another user's data via URL manipulation | Return 403 Forbidden; redirect to Dashboard |
| Admin deletes a user | Associated business data is retained for audit purposes; user can no longer log in |
| Company logo not uploaded | Bill and PO print layout renders without logo; no error thrown |
| Website not provided in Settings | Website field is omitted from bill and PO header; no error thrown |
| Supplier Invoice No left blank on PO | PO is saved and printed without a supplier invoice number; no validation error |
| Invalid or expired login session | Redirect to Login Page with session-expired message |
| Payment Status field present on bill print/export | Payment Status must be excluded from all printed and exported bill documents |
| Machine Running Hours entered as greater than 24 | Display validation error; value must be between 0 and 24 |
| Work log entry submitted without required fields | Display inline validation error; entry is not saved until all required fields are filled |
| Login OTP has expired | Display error message prompting user to request a new OTP |
| Login OTP is incorrect | Display validation error; allow user to re-enter or request a new OTP |
| Admin attempts to access a user's business data | Access is denied; Admin is restricted to user account-level information only |
| Export date range returns no records | Display a message indicating no records found for the selected date range; no file is generated |
| Export initiated without selecting a date range | Display a validation prompt requiring both From Date and To Date before proceeding |
| Bill To dropdown has no saved customers | Dropdown shows empty state with only the + Add New Customer option available |
| Supplier dropdown has no saved suppliers | Dropdown shows empty state with only the + Add New Supplier option available |
| Customer deleted after being referenced in a bill | Bill retains the customer details as stored at the time of bill creation; no data loss |
| Supplier deleted after being referenced in a PO | PO retains the supplier details as stored at the time of PO creation; no data loss |
| Help form submitted with empty required fields | Display inline validation errors; form is not submitted until all required fields are completed |
| Help form email delivery fails | Display an error message to the user and prompt them to try again |
| Delivery Challan saved without Purpose of Delivery | Display inline validation error; challan is not saved until Purpose of Delivery is selected |
| Delivery Challan item table has no rows | Display validation error; at least one item row must be present before saving |
| Delivery Challan Party GSTIN left blank | Challan is saved and printed without GSTIN; no validation error |
| Free plan user attempts to access Delivery Challan module | Display a locked state with an upgrade prompt; no challan data or creation option is shown; server-side access is blocked |
| Free plan user attempts to bypass Delivery Challan lock via URL or API | Server-side validation rejects the request; 403 Forbidden is returned |
| Free plan user attempts to use Payment Reminder Dropdown | Feature is hidden or disabled; upgrade prompt is displayed |
| Free plan user attempts to access Expenses module | Access is granted; no restriction applies; the module is fully available |
| Free plan user attempts to access Theme Builder | Access is granted; no restriction applies; the Theme Builder is fully available |
| Free plan user attempts to access Work Order module | Access is granted; no restriction applies; the Work Order module is fully available |
| Razorpay payment fails or is cancelled | Display an error message; subscription is not activated; user remains on Free plan |
| Razorpay webhook verification fails | Subscription is not activated; display an error message prompting user to contact support |
| User attempts to bypass subscription check | Subscription validation is enforced server-side; client-side bypass attempts are rejected |
| Premium subscription expires | Watermark is re-enabled on all subsequent print outputs; Delivery Challan module reverts to locked state; Payment Email Automation is restricted; user is shown the Upgrade button again |
| Admin account checked for subscription | Admin always has full access and no watermark; subscription check is skipped for Admin |
| User prints a document while subscription check is in progress | Print action waits for subscription validation result before rendering; watermark applied if status cannot be confirmed |
| Duplicate payment attempt for same plan period | Razorpay handles deduplication; system records only verified unique transactions |
| Subscription expiry notification email fails to send | Notification failure is logged; in-app notification is displayed as fallback |
| User registers with an email address already in use | Display an error message indicating the email is already registered; prompt user to log in or use a different email |
| User attempts to log in before verifying email | Login is denied; display message: 「Please verify your email address before logging in. Check your inbox for the verification code.」; the user is directed to the Email Verification Page |
| Verification email fails to send after registration | Account remains in pending state; failure is logged; user is shown an option to resend the verification code |
| Verification code has expired | Display an error message indicating the code has expired; provide option to request a new verification code |
| Verification code is invalid or incorrect | Display an error message; account remains unverified; user can re-enter or request a new verification code |
| User submits verification code for an already-verified account | Display a message indicating the account is already verified; redirect to Login Page |
| Resend verification code requested multiple times | Allow resend; apply a short cooldown period (e.g., 60 seconds) between resend requests to prevent abuse |
| P.O No radio button selected but input field left empty | Bill can still be saved; P.O No is stored as empty and omitted from the print layout |
| P.O No radio button not selected | P.O No field is hidden on the form and completely omitted from the bill print/download layout with no placeholder shown |
| Razorpay API keys not configured | Payment flow fails gracefully with an error message; subscription cannot be initiated until keys are correctly configured |
| SENDER_EMAIL or email service not configured | All email-dependent flows fail gracefully; failure is logged; user sees an appropriate error or fallback message |
| Registration form submitted without checking the Terms & Conditions and Privacy Policy checkbox | Display inline validation error; form is not submitted until the checkbox is checked |
| Subscription page 「Subscribe Now」 clicked without checking the Refund Policy checkbox | Button remains disabled; user must check the Refund Policy checkbox before proceeding |
| Company Setup / Settings form saved without checking the Data Security Policy checkbox | Display inline validation error; form is not saved until the checkbox is checked |
| Policy page link in checkbox or footer fails to open | Display a generic error; the form remains accessible and the user can retry |
| First Admin login welcome email fails to send | Failure is logged silently; Admin account remains fully active |
| Payment reminder email fails to send | Failure is logged; user is notified of the delivery failure where applicable |
| Payment confirmation email fails to send | Failure is logged; the Payment Status update is still saved; user is notified of the email delivery failure |
| Bank details not provided in Company Setup | Bank details section is omitted from payment reminder emails; no error thrown |
| AI Assistant chat popup fails to load | Display a generic error message within the popup; the main application remains unaffected |
| Bill design template not selected | Default to Orange Theme for print/download output |
| GST Number left blank in Company Setup | Form is saved without GST Number; no fetching is triggered; no error is shown |
| GST Number entered in Company Setup has invalid format | Display inline validation error (e.g., 「Invalid GSTIN format」); no API call is made |
| GST Fetching API returns no data for a valid GSTIN | Display inline message: 「GST details not found. Please enter details manually.」; form fields remain editable |
| GST Fetching API is unavailable or returns an error | Display inline message: 「Unable to fetch GST details at this time. Please enter details manually.」; form fields remain editable; no error blocks form saving |
| GST_API_KEY not configured in backend environment | GST fetching fails gracefully; inline message shown to user; failure is logged |
| Forgot Password reset link has expired or is invalid | Display an appropriate error message on the Reset Password Page; user must initiate the flow again from the Login Page |
| Forgot Email ID reset link has expired or is invalid | Display an appropriate error message on the Reset Email ID Page; user must initiate the flow again from the Login Page |
| New password and confirm password do not match on Reset Password Page | Display inline validation error; form is not submitted until values match |
| New email ID and confirm email ID do not match on Reset Email ID Page | Display inline validation error; form is not submitted until values match |
| Reset link used more than once | Link is invalidated after first use; subsequent attempts display an error indicating the link is no longer valid |
| Forgot Password or Forgot Email ID email fails to send | Display an error message on the Login Page prompting the user to try again |
| Authenticated user visits the Landing Page | User is redirected directly to the Dashboard |
| Expense entry submitted without required fields (Date, Expense Category, Amount) | Display inline validation error; entry is not saved until all required fields are completed |
| Expense Amount entered as zero or negative value | Display inline validation error; Amount must be a positive numeric value |
| Expenses module accessed by Free plan user | Module is fully accessible; no restriction applies |
| Expenses module accessed by Admin | Module is fully accessible; Admin can record and manage their own expense entries |
| Expense entry deleted | Total Expenses calculations update immediately to reflect the deletion |
| No expense entries exist for the selected date range filter | Display a message indicating no expense records found for the selected period; filtered total displays as zero |
| Dark mode toggle clicked | Theme switches immediately between light and dark; all visible UI elements update without page reload |
| User returns to the application in a new session | Previously saved theme preference (dark/light and active custom theme) is loaded from local storage and applied before content renders; no flash of incorrect theme |
| Local storage is unavailable or cleared | Application defaults to light mode and the default Orange theme; no error is thrown; user can re-select dark mode and re-apply a custom theme via the respective controls |
| User prints or downloads a document while in dark mode | Print/download output is always rendered in light mode regardless of the active theme; dark mode has no effect on document output |
| User prints or downloads a document while a custom theme is active | Print/download output is always rendered using the default light-mode Orange theme; custom themes have no effect on document output |
| Dark mode toggle state not reflected on a specific page or component | All pages and components must fully support both themes; any component failing to adapt is treated as a rendering defect |
| Custom theme name left blank on Theme Builder form | Display inline validation error; theme cannot be saved without a name |
| Custom theme name duplicates an existing saved theme name for the same user | Display inline validation error indicating the name is already in use; user must enter a unique name |
| Custom theme saved without all three required color values | Display inline validation error; all three color fields (primary, secondary, accent) are required before saving |
| Active custom theme deleted by the user | Interface reverts to the default Orange theme immediately; no error is thrown |
| Custom theme edited while currently active | Interface updates immediately to reflect the new color values upon saving |
| Custom theme color combination fails basic contrast check | Display an inline warning indicating potential readability issues; user may still save and apply the theme |
| Theme Builder accessed by Free plan user | Access is granted; no restriction applies; the Theme Builder is fully available |
| User applies a custom theme and then toggles dark mode | Dark mode applies the custom theme's color values adapted to dark-mode contrast requirements; both preferences are persisted independently in local storage |
| Custom theme applied on pre-login pages | Custom themes do not apply to pre-login pages or the Landing Page; default Orange theme is always used on these pages |
| Work order saved without required fields (Customer Name, Job Name, Quantity, Rate, Work Start Date) | Display inline validation error; work order is not saved until all required fields are completed |
| Work Track entry Completed Quantity would cause total completed to exceed Work Order Quantity | Display inline validation error in Work Track; entry is not saved until Completed Quantity is corrected |
| Work Order Quantity entered as zero or negative | Display inline validation error; Quantity must be a positive numeric value |
| Work Order Rate entered as zero or negative | Display inline validation error; Rate must be a positive numeric value |
| Work Track entry linked to a Work Order is deleted | The Work Order's Completed Quantity, Pending Quantity, and Status are automatically recalculated in real time to reflect the removal |
| Work Order linked to no Work Track entries | Completed Quantity = 0; Pending Quantity = Work Order Quantity; Status = Pending; no error is thrown |
| Work Order module accessed by Free plan user | Access is granted; no restriction applies; the Work Order module is fully available |
| Work Track entry saved without linking to a Work Order | Entry is saved with manually entered Customer Name and Job Name; no back-propagation occurs |
| Work Order Link dropdown in Work Track has no available work orders | Dropdown shows empty state; user can save the Work Track entry without linking to a Work Order |
| Work Track entry saved and linked Work Order Status was Pending (no prior entries) | Status updates immediately to In Progress; Completed Quantity and Pending Quantity update in real time |
| Work Track entries accumulate until Pending Quantity reaches 0 | Status updates automatically to Completed in real time; no manual status change is required |

---

## 6. Acceptance Criteria

- The Landing Page is the default entry point for all visitors; unauthenticated users are not redirected directly to the Login or Registration page
- The Landing Page displays the application title 「BusinessPlus」 prominently in the Hero Section
- The Landing Page Hero Section displays a tagline, two CTA buttons (Get Started Free and Log In), and a hero illustration with entrance animations
- The Landing Page Features Section displays a grid of feature cards including Work Orders, with icons, titles, and descriptions
- The Landing Page Pricing Preview Section displays Free and Premium plan cards with correct pricing and feature highlights
- The Landing Page Call-to-Action Section displays a full-width banner with a Sign Up for Free button
- The Landing Page uses smooth scroll behavior between sections and is fully mobile responsive
- Clicking 「Get Started Free」 or 「Sign Up for Free」 on the Landing Page navigates to the Registration Page
- Clicking 「Log In」 on the Landing Page navigates to the Login Page
- 「Forgot Password」 and 「Forgot Email ID」 links are displayed on the Login Page
- Clicking 「Forgot Password」 on the Login Page sends a reset email to the user's registered email address
- Clicking 「Forgot Email ID」 on the Login Page sends a reset email to the user's registered email address
- Clicking the reset link in the Forgot Password email opens the Reset Password Page
- Clicking the reset link in the Forgot Email ID email opens the Reset Email ID Page
- The Reset Password Page allows the user to enter and confirm a new password; successful submission updates the password in the backend and redirects to the Login Page
- The Reset Email ID Page allows the user to enter and confirm a new email ID; successful submission updates the email ID in the backend and redirects to the Login Page
- Reset links are single-use and time-limited; expired or reused links display an appropriate error
- Authenticated users visiting the Landing Page are redirected to the Dashboard
- The Landing Page uses the Orange color theme and is mobile responsive
- The footer on the Landing Page displays: Privacy Policy | Terms & Conditions | Refund Policy | Data Security Policy
- New user registration form (Create Account) collects First Name, Last Name, and Email Address only
- Registration form submission creates the account in a pending/unverified state; the account is NOT activated immediately
- A verification code is automatically sent to the registered email address upon successful form submission
- The user is redirected to the Email Verification Page after submitting the registration form
- The Email Verification Page displays an input field for the user to enter the verification code
- Upon entering the correct verification code, the account is activated, a welcome email is sent, and the user is redirected to the Login Page with a success message
- If the verification code is incorrect, an inline error is displayed and the user may re-enter
- If the verification code has expired, an inline error is displayed and a resend option is provided
- A resend verification code option is available on the Email Verification Page with a cooldown period
- The user cannot log in until the verification code has been entered and the account has been activated
- If a login attempt is made with an unverified account, an appropriate message is displayed and the user is directed to the Email Verification Page
- Login is performed using Email Address and OTP; the user enters their email, requests an OTP, and enters the OTP to log in
- Login OTP expires after 10 minutes; expired OTP prompts user to request a new one
- OSS Google login is supported on the Login Page
- Admin-created users are activated immediately without requiring email verification
- The Registration Page displays a mandatory checkbox for Terms & Conditions and Privacy Policy; the form cannot be submitted without checking this checkbox
- The Subscription Page displays a mandatory Refund Policy checkbox before the 「Subscribe Now」 button; the button is disabled until the checkbox is checked
- The Company Setup / Settings Page displays a mandatory Data Security Policy checkbox before the save action; the form cannot be saved without checking this checkbox
- All four policy pages are accessible and render correctly
- The footer displays links in the format: Privacy Policy | Terms & Conditions | Refund Policy | Data Security Policy on all pages
- When the first Admin user logs in for the very first time, a welcome email is automatically sent to the admin's registered email address
- Each user can complete company setup independently, and settings are not visible to other users
- The GST Number field in Company Setup is optional; the form can be saved without entering a GST Number
- When a valid GSTIN is entered in Company Setup, the GST Fetching System is triggered and auto-populates Company/Business Name, Registered Address, Mobile Number, and Email Address into the corresponding form fields
- All GST-fetched fields are editable before saving
- If the GSTIN format is invalid, an inline validation error is shown and no API call is made
- If the GST API returns no data or is unavailable, an appropriate inline message is shown and the form remains fully editable and saveable
- Company Setup includes optional Bank Details fields (Bank Name, Account Number, IFSC Code, Account Holder Name)
- GST Number in Customer records, Supplier records, and Purchase Order is entered manually with no auto-fetch behavior
- Company logo appears correctly on printed/downloaded bills
- Bills are generated with proper table borders, GST breakdown (CGST 9% + SGST 9%), and correct grand total
- After the Grand Total on every bill copy, a horizontal line is displayed followed by the Authorised Signature label; no computer-generated disclaimer text appears
- No terms and conditions text of any kind appears on any bill copy, printed bill document, or bill creation/view page
- The Bill creation and view page uses a modern, clean, and professional UI design
- If a website is entered in Settings, the domain is visible in the header of printed/downloaded bills and purchase orders
- Purchase orders display both the system-generated PO No and the optional Supplier Invoice No field
- Every newly created bill defaults to Payment Status: Unpaid
- Payment Status can be updated to Paid from the Bill List via the Payment Status dropdown
- When Payment Status is changed to Paid, a payment confirmation email is automatically sent to the customer (Premium users only)
- Payment Status does not appear on any printed or downloaded bill document or on any of the three bill copies
- Dashboard displays a Pending Payments summary card showing the count of bills with Pending status
- Dashboard displays a Total Delivery Challans summary card
- Dashboard displays a Total Expenses summary card showing the sum of expense amounts for the current month
- Dashboard displays a Total Work Orders summary card
- Bill List displays the Payment Status column and Payment Reminder column for each bill
- Payment Reminder Dropdown is visible and functional for Premium users; hidden or disabled for Free plan users
- Payment Reminder Dropdown values are: None / 7 Days / 30 Days / 45 Days / 90 Days
- If None is selected in the Payment Reminder Dropdown, no reminder email is sent
- If a day option is selected, a payment reminder email is scheduled and sent after the specified number of days from the bill date
- Payment reminder emails include a PDF attachment of the bill
- Payment reminder emails include bank details only if bank details are provided in Company Setup
- Every bill print/download output renders three clearly labeled copies: ORIGINAL, DUPLICATE, and TRIPLICATE
- Each of the three bill copies is visually identical in content; only the copy label differs
- The bill layout follows a minimalist corporate invoice design consistent with the reference image provided
- Bill View and Print supports 4 selectable design templates: Blue Theme, Orange Theme, Gray Theme, Purple Theme
- Each template renders the same bill content with different visual styling; designs are modern, clean, visually attractive, and professional branding-friendly
- All templates are print-ready and suitable for PDF export
- Bill print/download is rendered in proper A4 size with clean professional alignment, proper margins and spacing, and one-click Print functionality
- Purchase Order print/download is rendered in proper A4 size with clean professional alignment, proper margins and spacing, and one-click Print functionality
- Delivery Challan print/download is rendered in proper A4 size with clean professional alignment, proper margins and spacing, and one-click Print functionality, matching the professional quality of the bill print layout
- A P.O No radio button is displayed on the bill creation form
- When the P.O No radio button is not selected, the P.O No input field is hidden and no P.O No is associated with the bill
- When the P.O No radio button is selected, a manual text input field for P.O No becomes visible
- If P.O No is entered, it is printed immediately after the Invoice Date on all three bill copies
- If P.O No is not entered, the P.O No field is completely omitted from the print/download layout with no blank label or placeholder
- Export button is available on the Bill List page and the PO List page
- Billing export generates an Excel file with the correct columns for all bills within the selected date range
- Purchase Order export generates an Excel file with the correct columns for all POs within the selected date range
- PDF export is available as an optional format in both Billing and Purchase Order export
- Customer module allows users to create, edit, and delete customer records
- Bill To dropdown auto-fills customer details and supports inline customer creation
- Supplier module allows users to create, edit, and delete supplier records
- Supplier dropdown auto-fills supplier details and supports inline supplier creation
- Delivery Challan module is accessible only to Premium users and Admin; Free plan users see a locked state with an upgrade prompt and cannot create, view, or print any challan
- Delivery Challan access restriction is enforced server-side; client-side bypass attempts are rejected
- If a Premium subscription expires, the Delivery Challan module reverts to the locked state immediately
- Every Delivery Challan print/download output renders two clearly labeled copies: ORIGINAL and DUPLICATE on a single A4 page
- The declaration text 「Goods sent for Job Work / Return after Job Work and not for sale.」 appears on every printed Delivery Challan copy
- Delivery Challan print layout includes Prepared By and Authorised Signatory signature sections
- Delivery Challan creation does not affect stock quantities or financial records
- The Expenses tab is visible and accessible in the navigation for ALL logged-in users — Free plan users, Premium plan users, and Admin — with no subscription restriction
- The Expenses module is fully functional for Free plan users; no locked state, no upgrade prompt, and no restriction of any kind applies
- Admin users have full access to the Expenses module
- Users can add expense entries with Date, Expense Category, Description (optional), and Amount
- Expense entries are saved and displayed in the Expenses List with correct columns: Date, Expense Category, Description, Amount, Actions
- The Expenses List displays a Total Expenses (all time) and Total Expenses (current month) summary
- When a date range filter is applied on the Expenses List, a filtered total is displayed for the selected period
- Expense entries can be edited and deleted; calculations update immediately upon any change
- Expense entries submitted without required fields (Date, Expense Category, Amount) display inline validation errors and are not saved
- Amount field rejects zero or negative values with an inline validation error
- Reports module includes Total Expenses in all report types (Daily, Weekly, Yearly, Custom Date Range)
- Reports module line graph includes Expenses data alongside Sales and Purchases
- Reports module circular charts include expense breakdown by category
- Help / Support tab is displayed at the bottom of the application menu
- Help form validates required fields and delivers submission to the software team via email
- Daily Work Log entries can be created with all required fields; Machine Running Hours validates 0–24 range
- Multiple work log entries can be created for the same date
- Work Log List is filterable by date and work type
- Dashboard displays accurate counts and recent records scoped to the logged-in user
- Reports generate correctly for all report types and display dynamic line graphs, circular charts, and data tables
- Reports section displays professional graph-based analytics with dynamic line graphs and smooth circular charts
- User Management module is visible and functional only for Admin users
- All data is strictly isolated per user
- Login screen displays only the username derived from the email, not the full email address
- The application UI consistently applies the active color theme (default Orange or user's active custom theme on post-login pages)
- Admin User Management panel displays all registered/logged-in users with account, email verification status, and subscription details
- Admin can view all transaction records in the Transaction / Payment History Panel
- Admin cannot access any user's business data
- Application name is displayed as BusinessPlus throughout the system
- New users are assigned the Free plan by default upon account activation
- Free plan users see a semi-transparent watermark at the bottom of every printed/downloaded Bill (all three copies) and Purchase Order
- Watermark text is correct per document type as specified
- Watermark does not appear in the center of the document; it appears at the bottom
- Premium plan users and Admin users have no watermark on any printed/downloaded document
- The 「Upgrade to Premium」 button is visible in the top-right header and on the Dashboard for Free plan users
- The 「Upgrade to Premium」 button is not placed inside the navigation menu tab
- The 「Upgrade to Premium」 button is hidden for Admin users and active Premium subscribers
- Subscription Page plan comparison table includes Delivery Challan and Payment Email Automation as Premium-only features
- Subscription Page displays a Free vs Premium plan comparison with correct pricing (₹499/month, ₹5499/year)
- Razorpay payment gateway opens when 「Subscribe Now」 is clicked
- Payment methods supported: Card, UPI (Google Pay, PhonePe, Paytm, BHIM), QR Code
- Subscription activates immediately after successful Razorpay webhook verification
- Transaction record is created with all required fields upon successful payment
- Subscription status is checked on login, application start, and print action
- If a Premium subscription expires, watermarks are re-enabled, Delivery Challan module is locked, Payment Email Automation is restricted, and the Upgrade button reappears
- Admin always has full access and no watermark regardless of subscription state
- Subscription expiry notification is sent 7 days before expiry
- All outgoing emails are sent using the sender address configured via the SENDER_EMAIL environment variable
- AI Assistant floating icon is displayed at the bottom-right corner on all post-login pages
- Clicking the AI Assistant icon opens a small chat box popup
- The AI Assistant chat popup is minimal, fast, and non-intrusive
- The AI Assistant is available to all logged-in users regardless of subscription plan
- A dark mode toggle is visible and accessible on all pages including the Landing Page and all pre-login and post-login pages
- Clicking the dark mode toggle immediately switches the entire application between light and dark themes without a page reload
- In dark mode, all pages, components, forms, tables, charts, modals, dropdowns, and UI surfaces render correctly with appropriate dark-mode color values
- The active theme's accent color is retained in dark mode for interactive elements such as buttons, highlights, and active states
- The user's selected theme preference is persisted in local storage and automatically applied on the next page load without a flash of the incorrect theme
- When local storage is unavailable or cleared, the application defaults to light mode and the default Orange theme without throwing an error
- Print and PDF export outputs are always rendered in light mode using the default Orange theme regardless of the active theme or active custom theme; dark mode and custom themes do not affect any printed or downloaded document
- The dark mode toggle is accessible to all users including unauthenticated visitors on the Landing Page
- All four bill design templates render correctly in both light and dark modes on the Bill View / Print page
- Charts and graphs in the Reports module adapt correctly to dark mode with appropriate background and label colors
- The AI Assistant chat popup adapts correctly to dark mode
- The Theme Builder is accessible to all logged-in users regardless of subscription plan via Settings or a dedicated menu item
- The Theme Builder displays a list of all saved custom themes for the logged-in user, each showing the theme name and a color swatch preview of the primary, secondary, and accent colors
- A 「Create New Theme」 button opens the theme creation form
- The theme creation form includes fields for Theme Name, Primary Color, Secondary Color, and Accent Color
- A live preview panel is displayed during theme creation and editing, showing how the selected colors appear on representative UI elements
- A 「Save Theme」 button saves the theme to the user's saved theme list without applying it
- A 「Save and Apply」 button saves the theme and immediately applies it as the active interface theme
- When a custom theme is applied, it replaces the default Orange theme across all post-login pages and components
- The Landing Page and all pre-login pages always use the default Orange theme regardless of any active custom theme
- Custom theme preference is persisted in local storage and applied on page load before content renders
- If a custom theme is deleted while active, the interface reverts to the default Orange theme immediately
- Editing an active custom theme updates the interface immediately upon saving
- If a color combination fails a basic contrast check, an inline warning is displayed; the user may still save and apply the theme
- Custom themes are scoped strictly to the creating user; no other user can view or apply another user's custom themes
- Print and PDF export outputs always use the default light-mode Orange theme regardless of any active custom theme
- The Work Order tab is positioned in the navigation immediately before the Billing tab
- The Work Order module is accessible to all logged-in users regardless of subscription plan; no locked state or upgrade prompt is shown
- The Work Order List displays all work orders belonging to the logged-in user with columns: Work Order No, Customer Name, Job Name, Quantity, Rate, Completed Quantity, Pending Quantity, Work Start Date, Completion Date, Status, Actions
- Completed Quantity on the Work Order is automatically aggregated in real time from all linked Work Track entries and displayed as a read-only field
- Pending Quantity on the Work Order is automatically calculated in real time as Quantity minus Completed Quantity and displayed as a read-only field
- Status on the Work Order is automatically derived and updated in real time: Pending if no Work Track entries are linked; In Progress if at least one Work Track entry is linked and Pending Quantity > 0; Completed if Pending Quantity = 0
- When a Work Track entry is saved with Completed Quantity = 200 for a Work Order with Quantity = 500, the Work Order immediately reflects Completed = 200, Pending = 300, Status = In Progress without requiring a manual refresh
- When subsequent Work Track entries are saved and the cumulative Completed Quantity reaches 500, the Work Order immediately reflects Completed = 500, Pending = 0, Status = Completed
- The Work Order creation form includes all required fields: Customer Name, Job Name, Quantity, Rate, Work Start Date; and optional fields: Completion Date
- A work order cannot be saved without completing all required fields; inline validation errors are displayed for missing required fields
- Quantity and Rate reject zero or negative values with inline validation errors
- Work Order No is auto-generated and unique per user
- When a new work order is created, it is immediately available for selection in the Work Track module's Work Order Link dropdown
- When a Work Order is selected in a Work Track entry, Customer Name, Job Name, Total Quantity, Rate, and Current Pending Quantity are automatically pre-populated as read-only reference fields
- The user enters the Completed Quantity for the specific Work Track entry in an editable numeric field
- When a Work Track entry linked to a Work Order is saved or updated, the linked Work Order's Completed Quantity, Pending Quantity, and Status are automatically recalculated and updated in real time without requiring a manual refresh
- The total Completed Quantity across all linked Work Track entries cannot exceed the original Work Order Quantity; an inline validation error is displayed in Work Track if this condition would be violated
- When a linked Work Track entry is deleted, the Work Order's Completed Quantity, Pending Quantity, and Status are automatically recalculated in real time to reflect the removal
- Work order records are scoped strictly to the logged-in user; no other user can view, edit, or delete another user's work orders
- Work Order creation does not affect stock quantities, billing records, or purchase order records

---

## 7. Out of Scope for This Release

- GST auto-fetch via government API for Customer, Supplier, and Purchase Order forms
- Multi-currency support
- Inventory reorder automation or supplier notifications
- Mobile application (iOS / Android)
- Integration with accounting software (e.g., Tally, QuickBooks)
- Inter-user data sharing or collaborative workflows
- Audit log or activity history module
- Email or SMS notifications for low stock or invoice delivery
- IGST support (inter-state GST transactions)
- Role customization beyond Admin and Regular User
- Work log analytics or reporting (charts/summaries for work log data)
- Payment reminders or automated follow-up for Pending bills for Free plan users
- In-app live chat or real-time support ticketing system
- Help request tracking or status updates for submitted support queries
- Delivery Challan export to Excel or PDF (list-level export)
- Delivery Challan analytics or reporting
- Coupon codes or promotional discounts on subscription plans
- Subscription plan management by Admin (e.g., manually assigning Premium to a user)
- Refund processing for subscription payments
- Multiple simultaneous active subscriptions per user
- Two-factor authentication (2FA)
- Social login methods other than OSS Google login
- Scheduled or automated imports via API or file watcher
- Excel Import feature across all modules (Billing, Purchase Orders, Delivery Challans, Stock, Customers, Suppliers, Expenses, Work Orders)
- Forgot Password and Forgot Email ID flow accessible from the Landing Page (both flows are initiated from the Login Page only)
- AI Cam System (removed from this release)
- CNC CAM Integration Module (removed from this release)
- Expenses export to Excel or PDF
- Recurring or scheduled expense entries
- Expense approval workflows
- Theme synchronization across devices or backend storage of theme preference
- Automatic system-level dark mode detection or OS-level theme preference sync
- Custom theme sharing between users
- Predefined or system-provided theme presets beyond the default Orange theme
- Custom theme export or import
- Applying custom themes to the Landing Page or pre-login pages
- Custom themes affecting print or PDF export outputs
- Work Order export to Excel or PDF
- Work Order analytics or reporting (charts/summaries for work order data)
- Automated billing or invoice generation directly from a Work Order