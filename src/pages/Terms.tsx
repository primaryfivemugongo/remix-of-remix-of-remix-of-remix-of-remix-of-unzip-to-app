import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import { subDays, format } from "date-fns";

export default function Terms() {
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
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground pt-2">
              Last updated: {lastUpdated}
            </p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none space-y-6 text-muted-foreground">

            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Kyengera Parents' School - Mugongo School Portal ("the System"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the System.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p className="mb-4">
              The Kyengera Parents' School - Mugongo School Portal ("the System") is a comprehensive educational platform designed to serve the diverse needs of our school community through integrated digital services. The platform provides academic management capabilities that give users access to classes, assignments, grades, timetables, and complete academic records in a centralized, easily accessible format. Real-time attendance monitoring with advanced analytics, trend analysis, and reporting capabilities enables teachers and administrators to track student engagement and identify patterns that may require intervention or support.
            </p>
            <p className="mb-4">
              Our digital electoral system transforms school governance by providing a secure platform for prefect elections that encompasses candidate applications, campaign management, secure voting processes, and live results reporting, promoting democratic participation and leadership development. Communication tools embedded throughout the System create an internal messaging ecosystem connecting students, teachers, and administrators, facilitating timely information exchange and collaborative problem-solving. E-learning resources expand educational opportunities beyond the physical classroom through access to curated educational videos, a comprehensive digital library, and interactive learning materials that support diverse learning styles.
            </p>
            <p className="mb-4">
              Entertainment services curate age-appropriate educational content and streaming media that provide enrichment and relaxation within a supervised digital environment. Administrative functions support institutional operations through integrated finance management, stock control systems, analytics dashboards that inform decision-making, and comprehensive reporting tools that satisfy stakeholder accountability requirements. Event management features organize school life through digital calendars, event coordination tools, duty rota scheduling, birthday tracking that celebrates community members, and a Hall of Fame that recognizes excellence and achievement. Interactive features enhance engagement through educational games that reinforce learning objectives, gallery management systems that preserve school memories, and a help support system that ensures users can get assistance when needed. Underpinning all these capabilities is a robust user authentication system that implements secure role-based access control, ensuring students, teachers, and administrators each see appropriate content and features aligned with their responsibilities and needs.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
            <p className="mb-4">
              Access to the System's features requires creation of a user account, establishing your digital identity within our educational community. When you create an account, you enter into important commitments regarding the accuracy and security of your account information. You agree to provide accurate and complete information during registration, ensuring that we can properly identify you, communicate with you effectively, and provide services appropriate to your role. This obligation extends beyond initial registration—you must maintain and update your information to keep it current, reflecting changes in contact details, personal circumstances, or other relevant information that affects your relationship with the school.
            </p>
            <p className="mb-4">
              Password security represents a critical responsibility in protecting your account and the broader System. You agree to keep your password confidential and secure, never sharing it with others, avoiding easily guessed passwords, and storing credentials safely. If you suspect unauthorized access or discover that someone else has learned your password, you must notify us immediately so we can take protective measures to secure your account and investigate any potential security breach. Importantly, you accept responsibility for all activities that occur under your account, whether you personally performed those actions or they resulted from unauthorized access due to compromised credentials. This accountability encourages vigilant security practices and ensures that users understand the importance of protecting their authentication information.
            </p>

            <h2 className="text-xl font-semibold text-foreground">4. User Conduct</h2>
            <p className="mb-4">
              Maintaining a safe, respectful, and productive educational environment requires that all users commit to responsible conduct when using the System. You agree not to use the platform in ways that violate applicable laws or regulations, whether local, national, or international. This includes respecting the rights of others, particularly their privacy rights and intellectual property rights, which are fundamental to a trusting community. The System's technical integrity depends on users not uploading or transmitting viruses, malware, or malicious code that could damage infrastructure, compromise data, or disrupt services for other community members.
            </p>
            <p className="mb-4">
              Data protection and privacy extend beyond your own information to respecting others' data. You must not collect, harvest, or scrape information about other users without explicit authorization, as such activities violate privacy principles and potentially applicable data protection laws. The System's availability and performance depend on users not interfering with, disrupting, or compromising its proper functioning through denial-of-service attacks, resource exhaustion, or similar malicious activities. Attempts to gain unauthorized access to any portion of the System—including databases containing sensitive information, administrative functions reserved for school staff, or other users' accounts—constitute serious violations that undermine security for the entire community.
            </p>
            <p className="mb-4">
              Social conduct standards prohibit any form of harassment, bullying, intimidation, or inappropriate behavior that creates a hostile or uncomfortable environment for students, teachers, or administrators. The electoral voting system's integrity is paramount to fair school governance, so you must not manipulate or interfere with electoral processes or attempt to cast fraudulent votes that undermine democratic legitimacy. Academic integrity requires that you not submit false attendance records or academic information, as the accuracy of these records is essential for fair evaluation and institutional reporting. Automated systems or bots must not be used to access the System, as such tools can overwhelm resources, create unfair advantages, and circumvent security measures.
            </p>
            <p className="mb-4">
              Intellectual property protection requires that you not share, sell, or distribute System content without proper authorization from Kyengera Parents' School - Mugongo or the content's original creator. Impersonating other users, teachers, or administrators erodes trust, creates confusion, and may enable unauthorized access to sensitive information or functions. The messaging system exists to facilitate legitimate educational communications, not for spam, advertising, or inappropriate communications that waste recipients' time and attention. Finally, when uploading content to galleries, submitting assignments, or using communication channels, you must ensure that your contributions are appropriate, constructive, and aligned with educational purposes rather than being offensive or harmful.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. Content Guidelines</h2>
            <p className="mb-4">
              Users contribute content to the System through various features including profile information, assignment submissions, electoral campaign materials, messages, gallery images, and other forms of user-generated material. The relationship between you and the school regarding this content involves both retained ownership and granted permissions. You retain ownership of content you create and submit, meaning you continue to hold the underlying rights to your original work. However, by submitting content to the System, you grant Kyengera Parents' School - Mugongo a license to use, display, and distribute that content within the educational context necessary for the platform to function and for the school to fulfill its educational mission.
            </p>
            <p className="mb-4">
              This license enables essential System operations such as displaying your profile photo to other users, showing your assignment submissions to your teachers, presenting electoral campaign materials to voters, distributing your messages to intended recipients, and including your photos in school galleries. The educational context limitation means we will not use your content for unrelated commercial purposes or distribute it to third parties outside of the educational services described in these Terms.
            </p>
            <p className="mb-4">
              When you submit content, you accept important obligations regarding its nature and quality. All content must be appropriate for an educational environment, reflecting the values and standards we maintain in physical school settings. Content must not contain offensive, inappropriate, or harmful material that could create a hostile environment, disturb other users, or violate community standards of decency and respect. Intellectual property rights must be respected, meaning you should not upload copyrighted materials belonging to others unless you have proper authorization or the use constitutes fair use for educational purposes. When presenting information, particularly in academic assignments or electoral materials, factual accuracy is expected—you should not knowingly submit false or misleading information that could deceive others or undermine trust in institutional processes.
            </p>

            <h2 className="text-xl font-semibold text-foreground">6. Privacy and Data Protection</h2>
            <p>
              Your use of the System is also governed by our Privacy Policy. We are committed to protecting your personal information and comply with applicable data protection laws. We collect and use data only for legitimate educational purposes.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7. Academic Integrity</h2>
            <p className="mb-4">
              Academic integrity forms the foundation of honest scholarship and fair evaluation in educational institutions. All users of the System must uphold these principles throughout their engagement with academic features. This commitment means not engaging in plagiarism, cheating, or any form of academic dishonesty that misrepresents your knowledge or appropriates others' work as your own. When you use external sources, incorporate ideas from others, or build upon existing work, you must properly cite sources and references in all submitted assignments and projects, giving credit where credit is due and allowing readers to verify and explore your foundations.
            </p>
            <p className="mb-4">
              Assignments and assessments must be completed honestly and independently unless collaboration is explicitly authorized by your instructor. The integrity of your work reflects not only your own character but also the value of credentials and evaluations issued by the institution. You must never share login credentials with others or allow someone else to submit work on your behalf, as such actions constitute fraudulent misrepresentation of authorship. Collaboration on individual assignments is prohibited unless explicitly permitted by the instructor, as unauthorized collaboration undermines the assessment's ability to measure individual understanding and capabilities.
            </p>
            <p className="mb-4">
              Academic integrity extends beyond your own conduct to creating a culture of honesty. You should report any suspected academic integrity violations to school authorities, helping to maintain fairness for all students and protect the value of academic credentials. Accessing or viewing grades, assignments, or records of other students without proper authorization violates their privacy and potentially facilitates dishonest practices, and is therefore strictly prohibited.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7A. Electoral System Integrity</h2>
            <p className="mb-4">
              The digital electoral platform represents our commitment to democratic governance and student leadership development. The integrity of this system depends absolutely on user compliance with electoral rules and ethical conduct. Each eligible voter must vote only once per election using their assigned credentials, as multiple voting undermines the fundamental principle of equal representation. Any attempts to manipulate, influence, or compromise the voting system through technical exploits, social engineering, or other means constitute serious violations that threaten democratic legitimacy.
            </p>
            <p className="mb-4">
              Candidates must provide truthful information in their applications and campaign materials, as voters deserve accurate information to make informed decisions about school leadership. The confidentiality of voting processes and results must be respected until official announcements are made through proper channels, preventing premature or unauthorized disclosure that could influence ongoing voting or create confusion. Vote-buying, intimidation, or coercion of any kind violates the free and fair election principle that makes democratic processes meaningful. If you discover or suspect electoral fraud, system vulnerabilities, or violations of electoral rules, you must report these concerns immediately to school administrators so that issues can be investigated and remedied before they compromise election outcomes.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7B. Attendance System Use</h2>
            <p className="mb-4">
              The attendance tracking system serves multiple important purposes including academic evaluation, intervention identification, and institutional reporting. The system's usefulness depends entirely on the accuracy and honesty of recorded data. Students must not falsify or manipulate attendance records through any means, as such dishonesty can mask problems requiring attention, create unfair advantages, and corrupt the data used for institutional analysis. Teachers bear the responsibility to record attendance accurately and in a timely manner, as delayed or inaccurate recording undermines the system's utility for real-time monitoring and intervention.
            </p>
            <p className="mb-4">
              Users should understand that attendance data may be used for academic evaluation and reporting purposes, influencing grades, interventions, and communications with parents. This multiplicity of uses makes accuracy essential. Unauthorized access to or modification of attendance records, whether to alter your own records or those of others, is strictly prohibited and will be treated as a serious violation potentially warranting disciplinary action and criminal investigation, as such acts constitute fraud and data manipulation.
            </p>

            <h2 className="text-xl font-semibold text-foreground">8. System Availability and Maintenance</h2>
            <p className="mb-4">
              While we are committed to maintaining continuous availability of the System and invest significantly in reliable infrastructure, we cannot guarantee uninterrupted access under all circumstances. Technology systems face inherent limitations and unpredictable challenges that occasionally require temporary unavailability. The System may be temporarily inaccessible due to scheduled maintenance and updates necessary to implement security patches, add new features, optimize performance, and address technical issues. We attempt to schedule such maintenance during off-peak hours to minimize disruption to educational activities, and we provide advance notice when possible.
            </p>
            <p className="mb-4">
              Technical issues or system failures can occur despite our best efforts, including hardware failures, software bugs, network problems, database issues, and unexpected interactions between system components. When such issues arise, our technical team works diligently to diagnose and resolve them as quickly as possible. Force majeure events—circumstances beyond our reasonable control such as natural disasters, wars, terrorism, power failures, internet service provider outages, and other acts of God or third parties—may occasionally interrupt service availability. Security concerns may necessitate deliberately taking systems offline temporarily to investigate potential breaches, implement emergency patches, or prevent ongoing attacks. In all cases, we prioritize restoring services safely and securely rather than rushing to restore availability at the expense of security or data integrity.
            </p>

            <h2 className="text-xl font-semibold text-foreground">9. Modifications to Service</h2>
            <p className="mb-4">
              Educational technology evolves continuously, and Kyengera Parents' School - Mugongo reserves the right to modify, suspend, or discontinue any aspect of the System at any time to adapt to changing needs, incorporate new technologies, improve functionality, address security concerns, or respond to feedback from our school community. These modifications may involve adding new features that expand capabilities, removing features that are underutilized or superseded by better alternatives, changing user interfaces to improve usability, altering workflows to increase efficiency, or adjusting policies and procedures to better serve institutional needs.
            </p>
            <p className="mb-4">
              We commit to providing reasonable notice of significant changes when possible, balancing the need for user preparation against the need for rapid response to security threats or critical issues. Minor changes such as bug fixes, performance optimizations, and cosmetic updates may be implemented without notice, while substantial changes affecting core functionality, user workflows, or data handling will be communicated in advance through system announcements, email notifications, or other appropriate channels. Your continued use of the System after modifications constitutes acceptance of the changes. If you find modifications unacceptable, your remedy is to discontinue use of the System and, if appropriate, discuss concerns with school administration through proper channels.
            </p>

            <h2 className="text-xl font-semibold text-foreground">10. Intellectual Property Rights</h2>
            <p>
              All content, features, and functionality of the System, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Software code, design, graphics, and user interface</li>
              <li>Educational materials, e-learning videos, and library resources</li>
              <li>Entertainment content and streaming services</li>
              <li>System documentation and help materials</li>
              <li>Logos, trademarks, and branding elements</li>
            </ul>
            <p>
              are owned by Kyengera Parents' School - Mugongo or its licensors and are protected by copyright, trademark, and other intellectual property laws. Users are granted a limited, non-exclusive, non-transferable license to access and use the System for educational purposes only.
            </p>

            <h2 className="text-xl font-semibold text-foreground">11. User-Generated Content</h2>
            <p>
              Users may upload or submit content through various features including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Profile photographs and personal information</li>
              <li>Assignment submissions and project files</li>
              <li>Electoral candidate applications and campaign materials</li>
              <li>Messages and communications</li>
              <li>Gallery images and event photos</li>
              <li>Comments and feedback</li>
            </ul>
            <p>
              By submitting content, you grant Kyengera Parents' School - Mugongo a perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content for educational and administrative purposes. You represent and warrant that you own or have the necessary rights to submit such content and that it does not violate any third-party rights.
            </p>

            <h2 className="text-xl font-semibold text-foreground">12. Financial Transactions</h2>
            <p>
              The System includes finance management features for tracking tuition fees, payments, and school finances. Users acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All financial information is processed securely and confidentially</li>
              <li>Fee schedules and payment deadlines are subject to school policies</li>
              <li>Financial records displayed in the System are for informational purposes</li>
              <li>Official payment confirmations should be verified with the school's finance office</li>
              <li>Disputes regarding payments must be resolved through official school channels</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">13. Third-Party Services and Links</h2>
            <p>
              The System may integrate with or link to third-party services including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>E-learning video platforms and educational content providers</li>
              <li>Entertainment streaming services</li>
              <li>Cloud storage services for file management</li>
              <li>Analytics and reporting tools</li>
            </ul>
            <p>
              Kyengera Parents' School - Mugongo is not responsible for the content, privacy practices, or terms of service of any third-party services. Use of such services is at your own risk and subject to their respective terms and conditions.
            </p>

            <h2 className="text-xl font-semibold text-foreground">14. Termination</h2>
            <p>
              We may terminate or suspend your access to the System immediately, without prior notice, for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation of these Terms of Service</li>
              <li>Breach of school policies or code of conduct</li>
              <li>Academic dishonesty or electoral fraud</li>
              <li>Engaging in harmful, illegal, or inappropriate activities</li>
              <li>Compromising System security or other users' safety</li>
              <li>Unauthorized access attempts or hacking activities</li>
              <li>At the request of law enforcement or government agencies</li>
              <li>Non-payment of school fees (where applicable)</li>
              <li>Completion of studies or termination of employment with the school</li>
            </ul>
            <p>
              Upon termination, your right to access the System will cease immediately. We may retain certain information as required by law or for legitimate business purposes.
            </p>

            <h2 className="text-xl font-semibold text-foreground">15. Data Backup and Loss</h2>
            <p>
              While we implement regular backup procedures, users are encouraged to maintain their own copies of important documents and files. Kyengera Parents' School - Mugongo is not liable for any data loss, corruption, or unavailability of content, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Assignment submissions and project files</li>
              <li>Personal photographs and gallery images</li>
              <li>Messages and communication history</li>
              <li>User-generated content</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">16. Acceptable Use of Communication Features</h2>
            <p>
              The System's internal messaging and communication tools must be used responsibly and professionally:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Communications should be relevant to educational matters</li>
              <li>Harassment, bullying, or inappropriate language is strictly prohibited</li>
              <li>Users must respect the privacy and dignity of all community members</li>
              <li>Spam, advertising, or solicitation is not permitted</li>
              <li>All communications may be monitored for safety and security purposes</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">17. Disclaimer of Warranties</h2>
            <p>
              The System is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. Kyengera Parents' School - Mugongo does not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The System will function error-free or without interruption</li>
              <li>Defects will be corrected promptly</li>
              <li>The System is free from viruses or harmful components</li>
              <li>Results obtained from the System will be accurate or reliable</li>
              <li>E-learning content, entertainment services, or third-party integrations will always be available</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">18. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Kyengera Parents' School - Mugongo, its officers, directors, employees, contractors, and agents shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages arising from or related to your use of the System, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Loss of data, files, or academic work</li>
              <li>Loss of use or interruption of educational services</li>
              <li>Errors in grades, attendance records, or other data</li>
              <li>Unauthorized access to your account</li>
              <li>Technical malfunctions or system failures</li>
              <li>Actions or omissions of third-party service providers</li>
            </ul>
            <p>
              In no event shall our total liability exceed the amount of fees paid by you to Kyengera Parents' School - Mugongo in the twelve (12) months preceding the claim.
            </p>

            <h2 className="text-xl font-semibold text-foreground">19. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Kyengera Parents' School - Mugongo, its officers, directors, employees, contractors, agents, licensors, and suppliers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from or relating to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your violation of these Terms of Service</li>
              <li>Your violation of any rights of another party</li>
              <li>Your use or misuse of the System</li>
              <li>Your breach of any school policies or regulations</li>
              <li>Any content you submit, upload, or transmit through the System</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">20. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the Republic of Uganda, without regard to conflict of law principles. Any disputes arising from or relating to these Terms or the System shall be resolved as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>First, through good faith negotiation between the parties</li>
              <li>If negotiation fails, through mediation with a mutually agreed mediator</li>
              <li>If mediation is unsuccessful, through binding arbitration or the courts of Kampala, Uganda</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">21. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
            </p>

            <h2 className="text-xl font-semibold text-foreground">22. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Material changes will be communicated to users through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>In-system notifications</li>
              <li>Email announcements to registered email addresses</li>
              <li>Posted notices on the login page</li>
            </ul>
            <p>
              Your continued use of the System after such modifications constitutes your acceptance of the revised terms. If you do not agree to the modified terms, you must discontinue use of the System.
            </p>

            <h2 className="text-xl font-semibold text-foreground">23. Entire Agreement</h2>
            <p>
              These Terms of Service, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Kyengera Parents' School - Mugongo regarding the use of the System and supersede all prior agreements and understandings, whether written or oral.
            </p>

            <h2 className="text-xl font-semibold text-foreground">24. Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:<br /><br />
              Kyengera Parents' School - Mugongo<br />
              Kyengera Mugongo<br />
              Kampala, Uganda<br />
              Website: www.mugongo.sirapollokaggwaschools.co.ug<br />
              Phone: +256 753 616 792<br />
            </p>

            <p className="text-sm italic">
              By using the Kyengera Parents' School - Mugongo School Portal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}