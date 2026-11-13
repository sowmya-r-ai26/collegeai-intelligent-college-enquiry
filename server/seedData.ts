import type {
  ApplicationRecord,
  CollegeInfoPayload,
  CourseRecord,
  KnowledgeChunkRecord,
} from './types.ts';

const NOW_ISO = '2026-10-15T09:00:00.000Z';

export const SEED_COURSES: CourseRecord[] = [
  {
    id: 1,
    code: 'VET-AIDS-01',
    course_name: 'B.Sc Computer Science (Artificial Intelligence & Data Science)',
    course_category: 'AI & DS',
    level: 'UG',
    description:
      'Premier program blending Machine Learning, Neural Networks, Computer Vision, Big Data, and Generative AI with hands-on GPU lab projects and industry capstones.',
    duration: '3 Years',
    eligibility:
      '10+2 (Higher Secondary) pass with Mathematics or Computer Science and minimum 55% aggregate marks from a recognized board.',
    fees: '₹38,000 / Semester',
    fee_numeric: 38000,
    seats: 60,
    career_opportunities: [
      'Machine Learning Engineer',
      'Data Scientist',
      'AI Application Developer',
      'Business Intelligence Analyst',
      'Computer Vision Associate',
    ],
    featured: true,
    created_at: NOW_ISO,
  },
  {
    id: 2,
    code: 'VET-BCA-02',
    course_name: 'Bachelor of Computer Applications (BCA)',
    course_category: 'CS & IT',
    level: 'UG',
    description:
      'Comprehensive software engineering, web application development, mobile computing, and database systems curriculum designed for modern product engineering careers.',
    duration: '3 Years',
    eligibility:
      '10+2 (Higher Secondary) pass in any stream with Mathematics, Computer Applications, or Business Mathematics and minimum 50% aggregate.',
    fees: '₹32,000 / Semester',
    fee_numeric: 32000,
    seats: 120,
    career_opportunities: [
      'Full-Stack Web Developer',
      'Software Engineer',
      'Mobile Application Developer',
      'Cloud Support Associate',
      'Database Administrator',
    ],
    featured: true,
    created_at: NOW_ISO,
  },
  {
    id: 3,
    code: 'VET-CS-03',
    course_name: 'B.Sc Computer Science',
    course_category: 'CS & IT',
    level: 'UG',
    description:
      'Foundational and modern computing curriculum covering operating systems, algorithms, compiler design, cybersecurity, and cloud-native architecture.',
    duration: '3 Years',
    eligibility:
      '10+2 (Higher Secondary) pass with Mathematics and Computer Science or Physics with minimum 50% aggregate.',
    fees: '₹30,000 / Semester',
    fee_numeric: 30000,
    seats: 60,
    career_opportunities: [
      'Systems Programmer',
      'Backend Developer',
      'QA Automation Engineer',
      'Cybersecurity Analyst',
      'IT Infrastructure Specialist',
    ],
    featured: false,
    created_at: NOW_ISO,
  },
  {
    id: 4,
    code: 'VET-BCOM-04',
    course_name: 'B.Com (Professional Accounting)',
    course_category: 'Commerce',
    level: 'UG',
    description:
      'Integrated coaching alongside CA Foundation and CMA qualifications with intensive training in IFRS, taxation, auditing, and corporate law.',
    duration: '3 Years',
    eligibility:
      '10+2 (Higher Secondary) pass with Commerce and Accountancy (minimum 55% aggregate recommended).',
    fees: '₹34,000 / Semester',
    fee_numeric: 34000,
    seats: 60,
    career_opportunities: [
      'Chartered Accountancy Track',
      'Corporate Financial Auditor',
      'Taxation & GST Consultant',
      'Investment Banking Analyst',
      'Cost & Management Accountant',
    ],
    featured: false,
    created_at: NOW_ISO,
  },
  {
    id: 5,
    code: 'VET-BCOM-05',
    course_name: 'B.Com (Computer Applications)',
    course_category: 'Commerce',
    level: 'UG',
    description:
      'Unique blend of commercial accounting and modern enterprise software systems, ERP workflows, e-commerce, and business analytics.',
    duration: '3 Years',
    eligibility:
      '10+2 (Higher Secondary) pass with Commerce, Accountancy, or Computer Applications with minimum 50% aggregate.',
    fees: '₹28,000 / Semester',
    fee_numeric: 28000,
    seats: 60,
    career_opportunities: [
      'ERP Financial Consultant',
      'FinTech Operations Analyst',
      'E-Commerce Manager',
      'Accounts & MIS Executive',
      'Business Analyst',
    ],
    featured: false,
    created_at: NOW_ISO,
  },
  {
    id: 6,
    code: 'VET-BBA-06',
    course_name: 'BBA (International Business)',
    course_category: 'Management',
    level: 'UG',
    description:
      'Global supply chain, international trade law, cross-border corporate strategy, export-import management, and venture leadership.',
    duration: '3 Years',
    eligibility:
      '10+2 (Higher Secondary) pass in any recognized stream with minimum 50% aggregate marks.',
    fees: '₹32,000 / Semester',
    fee_numeric: 32000,
    seats: 60,
    career_opportunities: [
      'Global Supply Chain Coordinator',
      'International Trade Specialist',
      'Management Trainee',
      'Corporate Strategy Associate',
      'Business Development Lead',
    ],
    featured: false,
    created_at: NOW_ISO,
  },
  {
    id: 7,
    code: 'VET-MSC-07',
    course_name: 'M.Sc Data Analytics',
    course_category: 'AI & DS',
    level: 'PG',
    description:
      'Postgraduate advanced analytics, deep predictive modeling, time-series forecasting, MLOps, and cloud data engineering with research dissertation.',
    duration: '2 Years',
    eligibility:
      'Recognized Bachelor’s degree in Computer Science, Data Science, Mathematics, Statistics, or IT with minimum 55% aggregate.',
    fees: '₹42,000 / Semester',
    fee_numeric: 42000,
    seats: 30,
    career_opportunities: [
      'Senior Data Analyst',
      'Applied ML Researcher',
      'Data Engineering Lead',
      'Quantitative Risk Analyst',
      'Cloud Analytics Architect',
    ],
    featured: true,
    created_at: NOW_ISO,
  },
  {
    id: 8,
    code: 'VET-DIP-08',
    course_name: 'Diploma in Applied AI & Cloud Computing',
    course_category: 'CS & IT',
    level: 'Diploma',
    description:
      'Career-focused 1-year intensive diploma covering Python programming, Generative AI workflows, Docker containers, and cloud deployment practices.',
    duration: '1 Year',
    eligibility:
      '10+2 (Higher Secondary) pass or recognized polytechnic/diploma equivalent in any stream.',
    fees: '₹22,000 / Semester',
    fee_numeric: 22000,
    seats: 40,
    career_opportunities: [
      'AI Prompt & Workflow Specialist',
      'Junior Cloud Operations Associate',
      'Python Automation Developer',
      'Technical Support Engineer',
    ],
    featured: false,
    created_at: NOW_ISO,
  },
];

export const SEED_KNOWLEDGE: Array<Omit<KnowledgeChunkRecord, 'embedding' | 'created_at'>> = [
  {
    id: 1,
    title: 'VETIAS Institution Profile & Accreditation',
    category: 'Institution',
    source_file: '01_institution_overview.md',
    content:
      'VET Institute of Arts & Science (VETIAS) is a co-educational autonomous-track institution located in Erode, Tamil Nadu, affiliated with Bharathiar University, Coimbatore. Established under the Vellalar Educational Trust, VETIAS specializes in AI, Data Science, Computing, Commerce, and Global Management.',
  },
  {
    id: 2,
    title: 'Campus Location & Admissions Contact',
    category: 'Institution',
    source_file: '01_institution_overview.md',
    content:
      'VETIAS campus is situated at Thindal, Erode - 638012, Tamil Nadu. For unverified or bespoke admission queries, applicants can contact the Admissions Office at admissions@vetias.edu.in or call +91-4294-224400 (Monday to Saturday, 9:00 AM to 5:00 PM IST).',
  },
  {
    id: 3,
    title: 'B.Sc Computer Science (AI & Data Science) Overview',
    category: 'Courses',
    source_file: '02_academic_programs.md',
    content:
      'Course Code VET-AIDS-01: B.Sc Computer Science (Artificial Intelligence & Data Science) is a 3-year UG program with 60 seats intake. Tuition fee is ₹38,000 per semester. Curriculum covers Python, Machine Learning, Deep Learning, Computer Vision, Big Data, and Generative AI.',
  },
  {
    id: 4,
    title: 'Bachelor of Computer Applications (BCA) Overview',
    category: 'Courses',
    source_file: '02_academic_programs.md',
    content:
      'Course Code VET-BCA-02: Bachelor of Computer Applications (BCA) is a 3-year UG program with 120 seats intake. Tuition fee is ₹32,000 per semester. Focuses on full-stack web engineering, Java, mobile app development, DBMS, and cloud fundamentals.',
  },
  {
    id: 5,
    title: 'B.Sc Computer Science Overview',
    category: 'Courses',
    source_file: '02_academic_programs.md',
    content:
      'Course Code VET-CS-03: B.Sc Computer Science is a 3-year UG program with 60 seats intake. Tuition fee is ₹30,000 per semester. Covers operating systems, data structures, algorithms, compiler design, computer networks, and cloud infrastructure.',
  },
  {
    id: 6,
    title: 'B.Com (Professional Accounting) Overview',
    category: 'Courses',
    source_file: '02_academic_programs.md',
    content:
      'Course Code VET-BCOM-04: B.Com (Professional Accounting) is a 3-year UG program with 60 seats intake. Tuition fee is ₹34,000 per semester. Features integrated CA Foundation and CMA coaching alongside IFRS, corporate taxation, and auditing.',
  },
  {
    id: 7,
    title: 'B.Com (Computer Applications) Overview',
    category: 'Courses',
    source_file: '02_academic_programs.md',
    content:
      'Course Code VET-BCOM-05: B.Com (Computer Applications) is a 3-year UG program with 60 seats intake. Tuition fee is ₹28,000 per semester. Blends commercial accounting, Tally/ERP enterprise software, e-commerce, and business analytics.',
  },
  {
    id: 8,
    title: 'BBA (International Business) Overview',
    category: 'Courses',
    source_file: '02_academic_programs.md',
    content:
      'Course Code VET-BBA-06: BBA (International Business) is a 3-year UG management program with 60 seats intake. Tuition fee is ₹32,000 per semester. Covers global supply chains, international trade law, EXIM operations, and cross-border strategy.',
  },
  {
    id: 9,
    title: 'M.Sc Data Analytics Postgraduate Program',
    category: 'Courses',
    source_file: '02_academic_programs.md',
    content:
      'Course Code VET-MSC-07: M.Sc Data Analytics is a 2-year PG program with 30 seats intake. Tuition fee is ₹42,000 per semester. Covers advanced statistical modeling, time-series forecasting, deep predictive analytics, MLOps, and cloud data pipelines.',
  },
  {
    id: 10,
    title: 'Diploma in Applied AI & Cloud Computing',
    category: 'Courses',
    source_file: '02_academic_programs.md',
    content:
      'Course Code VET-DIP-08: Diploma in Applied AI & Cloud Computing is a 1-year career-oriented diploma with 40 seats intake. Tuition fee is ₹22,000 per semester. Eligibility: 10+2 pass or equivalent.',
  },
  {
    id: 11,
    title: 'UG & PG Admission Eligibility Criteria',
    category: 'Admissions',
    source_file: '03_admissions_and_eligibility.md',
    content:
      'For UG programs, candidates must have passed 10+2 (Higher Secondary) from Tamil Nadu State Board, CBSE, ICSE, or equivalent. B.Sc AI & DS requires at least 55% with Mathematics/Computer Science; BCA, B.Sc CS, B.Com CA, and BBA require 50%; M.Sc Data Analytics requires a relevant Bachelor degree with 55%.',
  },
  {
    id: 12,
    title: 'Online Admission Procedure (2026-2027 Session)',
    category: 'Admissions',
    source_file: '03_admissions_and_eligibility.md',
    content:
      'Admissions for Academic Session 2026-2027 Phase 2 are open. Step 1: Submit the Online Admission Application with Personal, 10th/12th Academic, and Course choices. Step 2: Receive a unique reference number (VETIAS-2026-APP-XXXX). Step 3: Attend counseling and original certificate verification on campus.',
  },
  {
    id: 13,
    title: 'Required Documents for Admission Verification',
    category: 'Admissions',
    source_file: '03_admissions_and_eligibility.md',
    content:
      'Shortlisted applicants must present: 10th and 12th standard original marksheets, Transfer Certificate (TC), Community Certificate (if applicable), First Graduate Certificate signed by Revenue Officer (if claiming First Graduate quota), Aadhaar Card copy, and 4 passport-size photographs.',
  },
  {
    id: 14,
    title: 'Application Tracking & Counseling Rounds',
    category: 'Admissions',
    source_file: '03_admissions_and_eligibility.md',
    content:
      'Applicants can track real-time application status using their reference number (e.g. VETIAS-2026-APP-XXXX) and registered email or mobile number. Status stages include Submitted, Under Review, Shortlisted for Round 1/2 Counseling, and Admission Confirmed.',
  },
  {
    id: 15,
    title: 'Merit & First Graduate Scholarships',
    category: 'Scholarships',
    source_file: '04_fees_and_scholarships.md',
    content:
      'VETIAS offers Merit Scholarships (up to 50% tuition waiver for 90%+ in +2 board exams, 25% waiver for 85-89.9%), First Graduate Scholarships (20% tuition concession with valid Revenue Officer certificate), Sports Excellence Scholarships, and Government SC/ST/BC/MBC scholarship assistance.',
  },
  {
    id: 16,
    title: 'Scholarship Deadlines & Fee Payment Policy',
    category: 'Scholarships',
    source_file: '04_fees_and_scholarships.md',
    content:
      'First Graduate and Merit Scholarship certificates for the 2026-2027 intake must be uploaded or submitted before November 15, 2026. Semester tuition fees cover lab access, library membership, and university exam registration.',
  },
  {
    id: 17,
    title: 'Boys & Girls Hostel Accommodation & Mess Fees',
    category: 'Campus Life',
    source_file: '05_hostel_and_campus_facilities.md',
    content:
      'Separate, secure on-campus residential hostels are available for boys and girls with 24/7 CCTV security, Wi-Fi, study halls, and medical support. Hostel accommodation plus nutritious vegetarian/non-vegetarian mess fee is ₹45,000 per academic year (twin-sharing) or ₹54,000 (single/AC wing where available).',
  },
  {
    id: 18,
    title: 'Laboratories, Library & Campus Transport',
    category: 'Campus Life',
    source_file: '05_hostel_and_campus_facilities.md',
    content:
      'Campus facilities include dedicated NVIDIA GPU AI & Data Science Labs, 350+ workstation coding centers, a central digital library with 42,000+ volumes and IEEE/Springer access, Dr. APJ Abdul Kalam Auditorium, indoor sports complex, and 28 GPS-enabled college buses covering Erode, Salem, Tiruppur, and Namakkal.',
  },
  {
    id: 19,
    title: 'Placement Record & Top Recruiters',
    category: 'Placements',
    source_file: '06_placements_and_recruiters.md',
    content:
      'VETIAS maintains a 94% placement success rate for eligible graduating students. Top recruiters include Zoho, TCS, Infosys, Wipro, Cognizant, HCLTech, Deloitte, EY, Accenture, and Freshworks. Highest package offered reached ₹12.5 LPA with an average package of ₹4.8 LPA.',
  },
  {
    id: 20,
    title: 'Placement Training & Career Readiness Cell',
    category: 'Placements',
    source_file: '06_placements_and_recruiters.md',
    content:
      'The Central Placement & Training Block runs mandatory aptitude, Data Structures & Algorithms, mock technical interviews, and communication workshops starting from Semester 3, alongside industry internships in Semester 5 and 6.',
  },
  {
    id: 21,
    title: 'CYBERTRON 2026 — National AI Symposium',
    category: 'Events',
    source_file: '07_events_and_notices.md',
    content:
      'CYBERTRON 2026 is the National AI Symposium and 24-hour Hackathon hosted by the Department of AI & DS on November 12, 2026 at Dr. APJ Abdul Kalam Auditorium. Features keynote sessions on Generative AI, project expo, and ₹1,50,000 prize pool.',
  },
  {
    id: 22,
    title: 'Annual Mega Campus Placement Drive 2026',
    category: 'Events',
    source_file: '07_events_and_notices.md',
    content:
      'The Annual Mega Campus Placement Drive 2026 takes place December 05–08, 2026 at the Central Placement & Training Block, bringing 45+ technology, analytics, and finance recruiters for final-year UG and PG cohorts.',
  },
  {
    id: 23,
    title: '12th Stream Guidance & Program Matching',
    category: 'Admissions',
    source_file: '03_admissions_and_eligibility.md',
    content:
      'Students from 12th Computer Science or Pure Mathematics streams excel in B.Sc CS (AI & DS), BCA, and B.Sc Computer Science. Commerce-Accountancy students are ideal for B.Com (Professional Accounting), B.Com (Computer Applications), and BBA (International Business). Maths-Biology students with strong analytical aptitude are eligible for BCA and BBA.',
  },
];

// Clearly marked demonstration records for testing Verification & Tracking flows
export const SEED_DEMO_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 1,
    application_number: 'VETIAS-2026-APP-4821',
    full_name: 'Sowmya R (Demo Applicant)',
    email: 'student.demo@vetias.edu.in',
    mobile_number: '9876543210',
    date_of_birth: '2008-05-14',
    gender: 'Female',
    address: '42 Perundurai Road, Erode, Tamil Nadu 638011',
    selected_course_id: 1,
    course_name: 'B.Sc Computer Science (Artificial Intelligence & Data Science)',
    course_code: 'VET-AIDS-01',
    academic_qualification: 'Computer Science',
    percentage: 94.2,
    tenth_percentage: 96.0,
    previous_institution: 'Bharathi Vidya Bhavan Higher Secondary School',
    quota: 'Merit',
    application_status: 'Shortlisted - Round 1',
    status_note: 'High academic merit in Mathematics & CS. Shortlisted for Round 1 counseling.',
    is_demo: true,
    created_at: '2026-10-18T10:15:00.000Z',
  },
  {
    id: 2,
    application_number: 'VETIAS-2026-APP-7319',
    full_name: 'Sowmya R (Demo Applicant)',
    email: 'student.demo@vetias.edu.in',
    mobile_number: '9876543210',
    date_of_birth: '2008-05-14',
    gender: 'Female',
    address: '42 Perundurai Road, Erode, Tamil Nadu 638011',
    selected_course_id: 2,
    course_name: 'Bachelor of Computer Applications (BCA)',
    course_code: 'VET-BCA-02',
    academic_qualification: 'Computer Science',
    percentage: 94.2,
    tenth_percentage: 96.0,
    previous_institution: 'Bharathi Vidya Bhavan Higher Secondary School',
    quota: 'First Graduate',
    application_status: 'Under Review',
    status_note: 'Certificates uploaded. Pending revenue officer verification.',
    is_demo: true,
    created_at: '2026-10-21T14:30:00.000Z',
  },
];

export const COLLEGE_INFO: CollegeInfoPayload = {
  institution_name: 'VET Institute of Arts & Science',
  short_code: 'VETIAS',
  affiliation: 'Bharathiar University Affiliation',
  location: 'Thindal, Erode - 638012, Tamil Nadu',
  academic_session: '2026–2027',
  admissions_email: 'admissions@vetias.edu.in',
  admissions_phone: '+91-4294-224400',
  website: 'https://vetias.edu.in',
  stats: {
    accredited_degrees: 8,
    placement_rate: '94%',
    rag_chunks: SEED_KNOWLEDGE.length,
    active_recruiters: '45+',
  },
  events: [
    {
      id: 'evt-cybertron-2026',
      title: 'CYBERTRON 2026 - National AI Symposium',
      date: 'November 12, 2026',
      venue: 'Dr. APJ Abdul Kalam Auditorium',
      tag: 'Tech Fest',
      description:
        'Annual national AI symposium and 24-hour hackathon hosted by the Department of AI & Data Science.',
    },
    {
      id: 'evt-placement-2026',
      title: 'Annual Mega Campus Placement Drive 2026',
      date: 'December 05 - 08, 2026',
      venue: 'Central Placement & Training Block',
      tag: 'Placement',
      description:
        'Four-day flagship campus recruitment drive featuring 45+ technology, analytics, and finance recruiters.',
    },
  ],
  notices: [
    {
      id: 'not-admissions',
      title: 'Admissions 2026–27 Open',
      body: 'Applications for B.Sc AI & DS, BCA, and B.Com PA are now being reviewed for Phase 2 counseling.',
      time_label: '10 mins ago',
      category: 'Admissions',
    },
    {
      id: 'not-cybertron',
      title: 'CYBERTRON 2026 Registration',
      body: 'Department of AI & DS invites team submissions for the national 24-hour hackathon.',
      time_label: '2 hours ago',
      category: 'Events',
    },
    {
      id: 'not-scholarship',
      title: 'Scholarship Submission Notice',
      body: 'First Graduate and Merit Scholarship certificates must be uploaded by Nov 15th.',
      time_label: '1 day ago',
      category: 'Scholarships',
    },
  ],
  placements: {
    rate: '94%',
    highest_package: '₹12.5 LPA',
    average_package: '₹4.8 LPA',
    top_recruiters: ['Zoho', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Deloitte', 'EY', 'Freshworks'],
    highlights: [
      'Dedicated Central Placement & Training Block with aptitude and coding bootcamps from Semester 3',
      'Mandatory industry internship in final year for all UG & PG computing and commerce cohorts',
      '45+ active corporate recruitment partners visiting during Annual Mega Placement Drive',
    ],
  },
  campus_life: {
    hostel_boys: '₹45,000 / year (Twin sharing + Mess)',
    hostel_girls: '₹45,000 / year (Twin sharing + Mess)',
    mess_fee: 'Included in annual hostel package (Veg & Non-Veg dining halls)',
    facilities: [
      { name: 'AI & GPU Computing Labs', detail: 'High-memory NVIDIA GPU workstations for ML, CV & Generative AI' },
      { name: 'Central Digital Library', detail: '42,000+ physical volumes, IEEE, Springer & ACM digital access' },
      { name: '24/7 Residential Hostels', detail: 'Separate secure hostels with Wi-Fi, study halls & medical care' },
      { name: 'GPS Fleet Transport', detail: '28 buses serving Erode, Tiruppur, Salem & Namakkal routes' },
    ],
  },
};
