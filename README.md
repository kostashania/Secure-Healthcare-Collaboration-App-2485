# Healthcare Collaboration Platform

A comprehensive healthcare collaboration platform built with React, Supabase, and Stripe. The platform supports multiple user roles including patients, doctors, nurses, administrators, and sponsors.

## Features

### 🔐 Authentication & Authorization
- **Multi-role authentication** (Patient, Doctor, Nurse, Admin, Sponsor)
- **Supabase Auth integration** with Row Level Security (RLS)
- **Role-based access control** and permissions
- **Secure session management**

### 👥 User Management
- **Patient-centered care model**
- **Healthcare provider assignments**
- **Team collaboration features**
- **Admin user management**

### 📁 Document Management
- **Secure file upload and storage**
- **Document categorization and tagging**
- **Role-based document access**
- **Patient-specific organization**

### 📅 Task & Appointment Management
- **Task assignment and tracking**
- **Calendar-based appointment scheduling**
- **Priority and status management**
- **Due date tracking and notifications**

### 💰 Monetization & Advertising
- **Sponsor role with advertisement management**
- **Stripe payment integration**
- **Multiple subscription packages**
- **Advertisement analytics and tracking**

### 🛡️ Admin Panel
- **Complete system administration**
- **User and content management**
- **Advertisement approval workflow**
- **System analytics and reporting**

## User Roles

### Patient
- View personal health information
- Manage care team assignments
- Access documents and appointments
- Complete assigned tasks

### Doctor
- Manage assigned patients
- Create and assign tasks
- Schedule appointments
- Upload and review documents

### Nurse
- Collaborate on patient care
- Complete assigned tasks
- Access patient documents
- Support care coordination

### Admin
- Full system administration
- User management
- Content moderation
- System configuration

### Sponsor
- Create and manage advertisements
- Purchase advertising packages
- View campaign analytics
- Track advertisement performance

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **UI/UX**: Framer Motion, React Icons
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthcare-collaboration-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase and Stripe credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Set up Supabase database**
   - Run the SQL migrations in your Supabase dashboard
   - Enable Row Level Security (RLS)
   - Configure authentication providers

5. **Configure Stripe**
   - Set up your Stripe account
   - Configure webhooks for payment processing
   - Set up product catalog for advertisement packages

6. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following main tables:

- `users_hc7891` - Extended user profiles
- `patients_hc7891` - Patient-specific medical information
- `relationships_hc7891` - Patient-provider relationships
- `documents_hc7891` - Medical documents and files
- `tasks_hc7891` - Healthcare tasks and assignments
- `appointments_hc7891` - Scheduled appointments
- `advertisements_hc7891` - Sponsor advertisements
- `advertisement_packages_hc7891` - Available ad packages
- `payments_hc7891` - Payment records and transactions

## Security Features

- **Row Level Security (RLS)** on all database tables
- **Role-based data access** with fine-grained permissions
- **Secure authentication** with Supabase Auth
- **HIPAA-compliant** data handling practices
- **Encrypted data storage** and transmission

## Payment Integration

The platform integrates with Stripe for:
- **Subscription management** for advertisement packages
- **Secure payment processing**
- **Automated billing cycles**
- **Payment history and invoicing**

## Advertisement System

Sponsors can:
- **Create targeted advertisements**
- **Choose from multiple packages** (Monthly, Quarterly, Semi-Annual, Annual)
- **Track performance metrics** (impressions, clicks, CTR)
- **Manage campaign budgets** and schedules

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@healthcare-collab.com or create an issue in the repository.