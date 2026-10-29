import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import { subDays, format } from "date-fns";

export default function Privacy() {
  const lastUpdated = format(subDays(new Date(), 7), "MMMM d, yyyy");
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <Link to="/login" className="inline-flex items-center text-primary hover:text-primary-hover mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground pt-2">
              Last updated: {lastUpdated}
            </p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none space-y-6 text-muted-foreground">

            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>
              Kyengera Parents' School - Mugongo ("we," "our," or "us") is committed to protecting the privacy of our students, parents, teachers, and staff. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our School Management System.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <p className="mb-4">
              We collect various types of information to provide and improve our comprehensive school management services. The scope of data collection reflects the multifaceted nature of modern educational institutions and enables us to deliver personalized, effective educational experiences while maintaining institutional excellence and security.
            </p>
            <p className="mb-4">
              Personal identification information forms the foundation of our user management system. We collect full names, dates of birth, and gender information to properly identify and address each member of our school community. Email addresses, including both school-provided and personal email accounts, enable critical communications between the school and families. Phone numbers for students, parents, and guardians ensure we can reach families in emergencies and for routine communications. Physical addresses and residential information support logistical planning and demographic understanding. Where applicable, national identification numbers assist in formal record-keeping requirements. Profile photographs and uploaded images personalize the user experience and help our community recognize one another. Emergency contact information ensures we can reach responsible parties when immediate communication is necessary for student welfare.
            </p>
            <p className="mb-4">
              Academic and educational information encompasses the comprehensive record of each student's educational journey. Student ID numbers and class assignments provide organizational structure to our academic programs. Academic records, grades, and performance assessments document learning progress and achievement. Attendance records capture date, time, and class information, creating a detailed picture of student engagement. Assignment submissions, projects, and coursework represent the tangible outputs of student learning. Timetables, class schedules, and duty rotas organize the daily rhythm of school life. Teacher evaluations and feedback provide qualitative insights into student development. Disciplinary records and behavioral notes document conduct and guide interventions when necessary. Stream and class placement information reflects academic organization and ability grouping. Academic transcripts and progress reports synthesize performance data for comprehensive evaluation and future planning.
            </p>
            <p className="mb-4">
              Electoral and voting information supports our democratic school governance system. Prefect candidate applications and campaign materials document leadership aspirations and qualifications. Voting records and ballot information maintain electoral integrity while respecting voter privacy. Electoral participation history tracks engagement in democratic processes. Candidate profile information and manifestos inform voters about leadership options. Vote timestamps and anonymized voting patterns provide aggregate insights while protecting individual voter choices.
            </p>
            <p className="mb-4">
              Financial information enables transparent and accurate fee management. Tuition fee records and payment history document financial transactions between families and the school. Outstanding balances and financial obligations provide clarity on current financial status. Payment method information is processed securely through compliant systems. Financial aid and scholarship information tracks assistance provided to families. Transaction receipts and invoices provide documentation for accounting and tax purposes.
            </p>
            <p className="mb-4">
              Communication and messaging data facilitates the exchange of information within our educational community. Internal messages between students, teachers, and administrators create channels for questions, clarifications, and collaboration. Communication logs and timestamps provide context and record-keeping for important exchanges. Help and support requests document technical and educational assistance needs. Feedback and survey responses gather community input on programs and services. Announcement acknowledgments confirm receipt of important information.
            </p>
            <p className="mb-4">
              Content and media enriches the educational experience and documents school life. Gallery photos and event images preserve memories and celebrate achievements. E-learning video viewing history helps track educational engagement and supports personalized learning recommendations. Entertainment content preferences and watch history enable age-appropriate content curation. Library book borrowing records manage resource allocation and track reading habits. Game scores and educational game progress document skill development in interactive learning environments. User-uploaded files and documents support assignments, projects, and creative expression.
            </p>
            <p className="mb-4">
              Technical and usage information ensures system security, performance, and improvement. Account credentials, including usernames and encrypted passwords, authenticate users and protect accounts from unauthorized access. Login times, session duration, and activity logs help identify unusual patterns that may indicate security concerns. IP addresses and device information support security measures and troubleshooting. Browser type, operating system, and device identifiers ensure compatibility and optimal performance across different platforms. Pages visited, features accessed, and navigation patterns inform user experience improvements. System performance data and error logs enable technical teams to identify and resolve issues proactively. Analytics data for system improvement drives evidence-based enhancements. Cookie and tracking technology data, as detailed in our Cookie Policy, support essential system functions and optional feature enhancements.
            </p>
            <p className="mb-4">
              Location and calendar information coordinates school activities and celebrations. Event attendance and participation records document engagement in extracurricular activities. Calendar entries and scheduled activities organize the school year and coordinate complex schedules. Birthday information enables celebration tracking and recognition of special occasions. Duty rota assignments and schedules distribute responsibilities and ensure smooth daily operations.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information collected through our System for legitimate educational purposes that are essential to providing comprehensive school management services. Our use of your information is carefully designed to support your educational journey, ensure system security, maintain institutional excellence, and comply with legal obligations.
            </p>
            <p className="mb-4">
              At the core of our educational services, we utilize your information to provide and maintain access to all System features and educational resources. This includes managing student enrollment and class assignments, tracking and evaluating student academic progress and performance, and creating and distributing timetables, schedules, and duty rotas. We process assignment submissions and manage grade records to provide timely feedback on academic performance. The System monitors and records student attendance with comprehensive analytics that help identify patterns and areas requiring intervention. This data facilitates meaningful teacher-student interactions and supports various learning activities designed to enhance educational outcomes.
            </p>
            <p className="mb-4">
              Communication and collaboration form another vital aspect of how we use your information. The System enables internal messaging between students, teachers, and administrators, creating a connected educational community. We send important announcements, notifications, and alerts to keep all stakeholders informed about critical school matters. The platform facilitates parent-teacher communication regarding student progress, ensuring that families remain engaged in their children's education. We provide help and support services to address technical and educational concerns, and we coordinate school events and activities to enrich the educational experience beyond the classroom.
            </p>
            <p className="mb-4">
              Our electoral system operations represent a unique feature of the platform that promotes student leadership and democratic participation. We process and review prefect candidate applications to ensure qualified candidates can participate in school governance. The System conducts secure digital voting for school elections, maintaining the integrity and confidentiality of the electoral process. We generate live election results and analytics to provide transparency and accountability. The platform is designed to maintain electoral integrity and prevent fraud through sophisticated verification mechanisms, and we archive historical electoral data to maintain institutional memory and track leadership development over time.
            </p>
            <p className="mb-4">
              Administrative and financial management capabilities are essential to school operations. We manage school finances, tuition fees, and payment tracking to ensure accurate financial records. The System generates financial reports and statements that provide insights into institutional financial health. We administer stock and inventory management to ensure resources are available when needed. The platform produces comprehensive analytics and performance dashboards that inform decision-making at all levels of school administration. These administrative reports support school management in strategic planning and operational excellence.
            </p>
            <p className="mb-4">
              Content and resource delivery extends learning beyond traditional boundaries. We provide access to e-learning videos and educational materials that supplement classroom instruction. The System manages digital library resources and borrowing systems, making knowledge accessible to all students. We curate and deliver appropriate entertainment content that provides educational value while respecting age-appropriate guidelines. The platform organizes and displays school gallery images and event photos, preserving memories and celebrating achievements. We track content usage to improve our offerings and provide personalized recommendations that enhance individual learning experiences.
            </p>
            <p className="mb-4">
              System security and integrity are paramount in protecting our educational community. We authenticate users and prevent unauthorized access through robust security measures. The System detects and prevents security threats and fraud by continuously monitoring for suspicious activities. We monitor system performance and identify technical issues before they impact users, ensuring reliable access to educational resources. Audit logs are maintained for accountability and compliance purposes, creating a transparent record of system activities. When policy violations or inappropriate behavior occur, we investigate thoroughly to maintain a safe and productive learning environment.
            </p>
            <p className="mb-4">
              Analytics and improvement initiatives drive continuous enhancement of our educational platform. We analyze usage patterns to improve system functionality and user experience. The System generates attendance trends and academic performance analytics that help educators identify students who may need additional support. We create visualizations and reports for data-driven decision making that improves educational outcomes. By identifying areas for educational improvement, we can allocate resources effectively. The platform evaluates the effectiveness of teaching methods and resources, supporting professional development and instructional excellence.
            </p>
            <p className="mb-4">
              Legal and compliance considerations guide all aspects of data use. We comply with educational regulations and legal requirements at local, national, and international levels. The System enables us to respond appropriately to legal processes, court orders, and government requests when required by law. We maintain records as mandated by educational authorities and legal frameworks. Protecting the rights and safety of our school community is a fundamental responsibility that shapes our data practices. We enforce our Terms of Service and school policies consistently to maintain a respectful and productive educational environment for all users.
            </p>

            <h2 className="text-xl font-semibold text-foreground">4. Information Sharing and Disclosure</h2>
            <p className="mb-4">
              We maintain strict principles regarding information sharing and disclosure. We do not sell, trade, or rent your personal information to third parties for marketing purposes or commercial gain. Your educational data is entrusted to us for the sole purpose of supporting your academic journey and school operations, and we honor that trust by sharing information only in limited, necessary circumstances that directly support educational objectives or legal obligations.
            </p>
            <p className="mb-4">
              Within our school community, information sharing follows the principle of legitimate educational interest. Teachers and educators receive access to student academic records, attendance data, grades, and assignments for students enrolled in their classes, enabling them to provide effective instruction and meaningful feedback. School administrators access comprehensive data for administrative purposes, analytical work, and reporting responsibilities that support institutional decision-making and improvement. Other students may see limited information that facilitates community building and awareness, such as class rosters that help students identify classmates, electoral candidate information that supports informed voting, hall of fame achievements that celebrate excellence, and gallery photos that document shared experiences. Parents and guardians receive access to their child's complete academic records, attendance history, grades, and all communications with teachers, ensuring they remain full partners in their child's education.
            </p>
            <p className="mb-4">
              Service providers and partners play essential roles in delivering educational services, and we share information with them under strict contractual protections. Cloud hosting services that provide secure data storage and system infrastructure receive technical data necessary for system operation. E-learning platforms and educational video content delivery services access usage information to provide streaming capabilities and track educational engagement. Entertainment providers that supply licensed streaming content receive viewing preferences to deliver age-appropriate content. Analytics services that monitor system performance and inform improvements process anonymized usage data. Communication services that power email and messaging infrastructure handle message delivery while maintaining security. Payment processors manage secure financial transaction handling for tuition payments through PCI-compliant systems. All service providers are contractually obligated to maintain the confidentiality and security of your information and may use it only for the specific purposes for which it was shared, never for their own commercial purposes.
            </p>
            <p className="mb-4">
              Legal and regulatory requirements sometimes necessitate information disclosure beyond our normal practices. We respond to lawful demands when required by statute, regulation, legal process, or government request. Compliance with educational reporting requirements and audits ensures we meet our obligations to education authorities. Court orders, subpoenas, and legal proceedings receive appropriate responses after careful legal review. Law enforcement investigations receive cooperation when legally required and when doing so protects our community. We carefully evaluate each legal request to ensure it is properly authorized and narrowly tailored to legitimate needs.
            </p>
            <p className="mb-4">
              Safety and protection of our school community may require information sharing in specific circumstances. We disclose information when necessary to protect the rights, property, or safety of Kyengera Parents' School - Mugongo, our students, staff, or others from harm. Suspected violations of our Terms of Service or school policies trigger investigations that may involve reviewing relevant user data. Security issues, fraud attempts, or technical problems that threaten system integrity prompt information sharing with security experts and law enforcement. Emergency situations where student welfare is at immediate risk override normal privacy constraints, as protecting our students is our highest priority.
            </p>
            <p className="mb-4">
              With your explicit consent, we may share information for purposes you specifically authorize. When you explicitly authorize us to share your information with third parties, such as external academic programs or educational competitions, we honor those permissions. Specific purposes you approve through informed consent, such as participation in optional surveys or research studies that may benefit the broader educational community, proceed only with your clear agreement. You retain control over these discretionary sharing decisions and can withdraw consent where legally permissible.
            </p>
            <p className="mb-4">
              Business transfers represent another limited circumstance where information sharing may occur. In the unlikely event of a merger, acquisition, reorganization, or sale of assets, student information may be transferred as part of that transaction to ensure continuity of educational services. We commit to notifying affected users of any such change in ownership or control of personal information, providing transparency about who will become responsible for protecting your data. Any successor organization would be bound by the privacy commitments made in this policy unless you consent to changes.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection practices</li>
              <li>Regular backups and disaster recovery procedures</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">6. Rights of Parents and Students</h2>
            <p>
              Under FERPA and applicable laws, parents and eligible students have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access educational records</li>
              <li>Request corrections to inaccurate information</li>
              <li>Control disclosure of personally identifiable information</li>
              <li>File complaints regarding privacy violations</li>
              <li>Opt-out of certain data uses (where applicable)</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">7. Children's Privacy (COPPA Compliance)</h2>
            <p>
              Kyengera Parents' School - Mugongo serves students who may be under the age of 13. We are committed to complying with the Children's Online Privacy Protection Act (COPPA) and protecting the privacy of minor students:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We collect personal information from children only for legitimate educational purposes</li>
              <li>Parental consent is obtained where required by law for collection of children's data</li>
              <li>Parents/guardians have the right to review their child's information</li>
              <li>Parents can request deletion of their child's information (subject to legal retention requirements)</li>
              <li>Parents can refuse further collection or use of their child's information</li>
              <li>We do not require children to provide more information than necessary for educational purposes</li>
              <li>We do not share children's information with third parties except as described in this policy</li>
              <li>Children's information is protected with the same security measures as adult information</li>
            </ul>
            <p>
              Parents or guardians who wish to review, modify, or delete their child's information should contact the school administration using the contact information provided at the end of this policy.
            </p>

            <h2 className="text-xl font-semibold text-foreground">8. Data Retention and Deletion</h2>
            <p>
              We retain personal information in accordance with legal requirements and legitimate educational purposes:
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-4">8.1 Active Student Records</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Student academic records, grades, and attendance are maintained throughout enrollment</li>
              <li>Electoral records are retained for historical and transparency purposes</li>
              <li>Communication logs are kept for the duration of system use</li>
              <li>Financial records are maintained according to accounting regulations</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">8.2 Alumni and Former Staff</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Academic transcripts and essential records are retained permanently for alumni verification</li>
              <li>Graduation records and final grades are archived indefinitely</li>
              <li>Non-essential data (such as daily attendance records) may be deleted after a reasonable period</li>
              <li>Access credentials are deactivated but core records are preserved</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">8.3 Legal and Compliance Requirements</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Records required by law or regulation are retained for the legally mandated period</li>
              <li>Financial records are kept according to tax and accounting requirements</li>
              <li>Disciplinary and safety-related records are maintained as required by education authorities</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">8.4 Data Deletion Procedures</h3>
            <p>
              When information is no longer needed and not subject to legal retention requirements, we:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Securely delete or anonymize the data</li>
              <li>Remove personally identifiable information while retaining anonymized statistical data</li>
              <li>Purge data from active systems and backup archives</li>
              <li>Ensure third-party service providers also delete relevant data</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">9. Cookies and Tracking Technologies</h2>
            <p>
              Our System uses cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain user sessions and preferences</li>
              <li>Improve system performance and user experience</li>
              <li>Analyze usage patterns for system improvement</li>
              <li>Ensure security and detect unusual activity</li>
            </ul>
            <p>
              You can manage cookie preferences through your browser settings, though some features may not function properly without cookies.
            </p>

            <h2 className="text-xl font-semibold text-foreground">10. Third-Party Services</h2>
            <p>
              We may use third-party services for specific educational functions. These services are carefully selected and required to maintain appropriate privacy standards. We do not control the privacy practices of third-party websites linked from our System.
            </p>

            <h2 className="text-xl font-semibold text-foreground">11. International Data Transfers</h2>
            <p>
              Our System may involve the transfer of data to service providers located in different countries. When we transfer data internationally:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We ensure appropriate safeguards are in place to protect your information</li>
              <li>We use service providers who comply with international data protection standards</li>
              <li>We implement technical and organizational measures to secure data in transit</li>
              <li>We ensure compliance with applicable data protection laws and regulations</li>
              <li>We verify that recipient countries provide adequate levels of data protection</li>
            </ul>
            <p>
              Data may be transferred to cloud hosting providers, content delivery networks, and other service providers that may operate internationally. All such transfers comply with this Privacy Policy and applicable legal requirements.
            </p>

            <h2 className="text-xl font-semibold text-foreground">11A. Specific Data Categories and Protection</h2>
            
            <h3 className="text-lg font-semibold text-foreground mt-4">Electoral Data Protection</h3>
            <p>
              Voting information is subject to enhanced protection measures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Individual votes are anonymized and encrypted</li>
              <li>Voting patterns are analyzed only in aggregate form</li>
              <li>Vote counts are verified through secure auditing processes</li>
              <li>Access to raw voting data is strictly limited to authorized electoral administrators</li>
              <li>Electoral results are published without revealing individual voting choices</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">Attendance Data Protection</h3>
            <p>
              Attendance information is used for educational and administrative purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Attendance records are accessible to students, their parents, teachers, and administrators</li>
              <li>Aggregate attendance statistics may be used for reporting and analytics</li>
              <li>Attendance trends inform intervention and support programs</li>
              <li>Historical attendance data may be reviewed for academic evaluation</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">Communication Privacy</h3>
            <p>
              Messages and communications within the System:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Are private between sender and recipient</li>
              <li>May be monitored by administrators for safety and policy compliance</li>
              <li>Are not shared with unauthorized third parties</li>
              <li>May be reviewed in investigations of policy violations or safety concerns</li>
              <li>Are subject to school code of conduct and acceptable use policies</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-4">Financial Information Protection</h3>
            <p>
              Financial data receives enhanced security measures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment information is processed through secure, PCI-compliant systems</li>
              <li>We do not store full credit card or payment details on our servers</li>
              <li>Financial records are encrypted and access-controlled</li>
              <li>Tuition and payment information is confidential between school and payer</li>
              <li>Financial data is used only for legitimate billing and accounting purposes</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of material changes through the System or by email. The "Last Updated" date at the top indicates when the policy was last revised.
            </p>

            <h2 className="text-xl font-semibold text-foreground">13. Contact Information</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <p>
              Data Protection Officer<br />
              Kyengera Parents' School - Mugongo<br />
              Kyengera Mugongo<br />
              Kampala, Uganda<br />
              Website: www.mugongo.sirapollokaggwaschools.co.ug<br />
              Phone: +256 753 616 792<br />
            </p>

            <h2 className="text-xl font-semibold text-foreground">14. Complaints</h2>
            <p>
              If you believe we have not addressed your concerns adequately, you have the right to file a complaint with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The school's Board of Directors</li>
              <li>Your local education authority</li>
              <li>The relevant data protection authority</li>
            </ul>

            <p className="text-sm italic">
              By using the Kyengera Parents' School - Mugongo School Portal, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}