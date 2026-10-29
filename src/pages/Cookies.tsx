import { Footer } from "@/components/layout/Footer";
import { Link } from "@/lib/router-compat";
import { subDays, format } from "date-fns";

export default function Cookies() {
  const lastUpdated = format(subDays(new Date(), 7), "MMMM d, yyyy");
  
  return (
    <div className="min-h-screen flex flex-col animate-page-in">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/login" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Login
        </Link>
        
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
          
          <p className="text-muted-foreground mb-6">
            Last updated: {lastUpdated}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What are cookies?</h2>
            <p className="text-muted-foreground mb-4">
              Cookies are small text files that uniquely identify your browser or device. The cookie file is stored on your browser. 
              When you return to that website (or visit websites that use the same cookies) these websites recognize the cookies and your browsing device.
            </p>
            <p className="text-muted-foreground mb-4">
              Cookies do many different jobs, like letting you navigate between pages efficiently, remembering your preferences, 
              and generally improving your experience. Cookies can tell us, for example, whether you have visited our Services before.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Are there different types of cookies?</h2>
            <p className="text-muted-foreground mb-4">
              There are different types of cookies, including first party cookies (which are served directly by us to your computer or device) 
              and third party cookies (which are served by a third party on our behalf). Third party cookies enable third party features or 
              functionality to be provided on or through the website (e.g. advertising, interactive content and analytics). The parties that 
              set these third party cookies can recognise your computer both when it visits the website in question and also when it visits 
              certain other websites.
            </p>
            <p className="text-muted-foreground mb-4">
              Cookies can remain on your device for different periods of time. Some cookies are session cookies, meaning that they exist only 
              while your browser is open and are deleted automatically once you close your browser. Other cookies are permanent cookies, meaning 
              that they survive after your browser is closed. They can be used to recognise your computer when you open your browser and browse 
              the Internet again.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. What are cookies used for?</h2>
            <p className="text-muted-foreground mb-4">
              The Kyengera Parents' School - Mugongo School Portal uses cookies and similar technologies for various purposes that enhance your educational experience, ensure system security, and enable essential features that make the platform functional and user-friendly.
            </p>
            
            <p className="text-muted-foreground mb-4">
              <strong>Essential cookies form the foundation of System functionality and cannot be disabled</strong>, as they are strictly necessary for the platform to operate. These critical cookies maintain your logged-in session, verifying your identity continuously to prevent unauthorized access to your account and personal information. They remember your role within the school community—whether you are a student, teacher, or administrator—and provide role-appropriate features and content tailored to your specific needs. The electoral system relies on essential cookies to ensure voters can only cast their ballot once, preventing electoral fraud and maintaining democratic integrity. When you fill out assignment submissions, applications, or other forms, essential cookies preserve your information so you don't lose your work if you navigate away temporarily. Load balancing cookies distribute system traffic efficiently to ensure stable performance even during peak usage periods. Security protection cookies defend against cross-site request forgery attacks and other security threats that could compromise your account or the System's integrity.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Functionality cookies remember your choices and preferences</strong> to create a personalized experience that adapts to your individual needs. These cookies store your theme selection, whether you prefer light or dark mode, along with language preferences and display settings that make the System comfortable for your eyes and easy to navigate. Your navigation state is preserved, remembering which sections of the sidebar you've expanded or collapsed so the interface remains organized according to your preferences. View preferences for timetables, calendars, and reports are saved so you don't have to reconfigure your preferred display format each time you access these features. Content filters and search preferences are remembered, making it faster to find the information you need without repeatedly entering the same search criteria. Your personalized dashboard layout, including widget arrangements and displayed information, remains consistent across sessions. The e-learning video player remembers your preferences for volume levels, playback speed, and caption settings so your learning experience remains comfortable and accessible. Notification preferences control how and when you receive system notifications, ensuring you stay informed without being overwhelmed by alerts.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Performance and analytics cookies help us understand how the System is used</strong> and identify opportunities for improvement that benefit the entire school community. Usage analytics track which features are accessed most frequently—such as assignments, attendance tracking, the electoral system, or e-learning resources—helping us prioritize development efforts and resource allocation. Performance monitoring measures page load times, system response times, and identifies slow or problematic features so our technical team can optimize the platform for speed and reliability. Error tracking detects and logs technical issues automatically, enabling our developers to identify and fix problems proactively before they significantly impact your experience. Feature adoption analytics help us understand how new capabilities like the electoral voting system or e-learning platform are being utilized, informing decisions about future enhancements and training needs. Session duration analysis reveals how long users engage with different features, indicating which tools are most valuable and which may need improvement. Navigation pattern analysis tracks user journeys through the System, helping us optimize workflows and make commonly-used features more accessible. Device and browser analytics ensure compatibility across different platforms, from desktop computers to mobile devices, and across various web browsers. Attendance analytics aggregate attendance patterns in anonymized form for reporting purposes and trend analysis that helps identify systemic issues requiring attention.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Communication and interaction cookies facilitate the messaging and collaboration features</strong> that connect our school community. These cookies track unread messages, conversation history, and notification status so you never miss important communications from teachers, administrators, or fellow students. Chat session cookies maintain active communication sessions in the messaging system, ensuring smooth, uninterrupted conversations. Notification delivery cookies ensure timely delivery of system announcements and alerts, keeping everyone informed about important school matters, schedule changes, and deadlines.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Content delivery cookies optimize how educational and entertainment content reaches you</strong>, making your learning experience more efficient and personalized. E-learning progress tracking cookies remember where you left off in educational videos so you can resume exactly where you stopped, maintaining continuity in your learning. Entertainment preference cookies remember your watch history and content preferences in the entertainment section, helping the System suggest age-appropriate content that aligns with your interests. Library record cookies manage your book borrowing status and reading history, making it easy to track which resources you've used and which are available. Gallery navigation cookies remember your position when browsing photo galleries, so you don't have to start from the beginning each time you view school event photos. Game progress cookies save your scores and progress in educational games like Typing Wizard, maintaining a record of your skill development over time. Content recommendation cookies analyze your usage patterns to suggest relevant educational resources that complement your coursework and learning goals.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Third-party cookies are set by external services we integrate with</strong> to provide enhanced functionality that we cannot offer independently. Video hosting platforms place cookies to enable e-learning content delivery and smooth video playback without interruption. Cloud storage services use cookies to manage file uploads and downloads in gallery features and assignment submissions. Analytics providers deploy cookies to gather comprehensive usage insights that inform platform improvements. Content delivery networks use cookies to optimize delivery of images, videos, and other media files, ensuring fast loading times and reliable access to resources regardless of your location or network conditions. These third-party services are carefully selected for their quality and security standards, and they are contractually required to respect user privacy and data protection principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. How can you control cookies?</h2>
            <p className="text-muted-foreground mb-4">
              You have multiple options to control and manage the cookies used by the Kyengera Parents' School - Mugongo School Portal. We respect your right to make informed decisions about cookie usage while also ensuring you understand how different choices may affect your experience with the platform.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Our Cookie Consent Manager provides the primary interface for cookie preferences.</strong> When you first access the System, you will be presented with a comprehensive Cookie Consent Manager that explains our cookie practices and provides clear choices. You can accept all cookies to enable full System functionality and enjoy all features without limitation. Alternatively, you may reject non-essential cookies while keeping essential cookies active, allowing you to use core features while limiting data collection for analytics and personalization. For those who want granular control, you can customize your preferences by selecting specific cookie categories, choosing exactly which types of cookies you are comfortable with. The Cookie Consent Manager provides detailed information about each cookie category, explaining what each type does and how it affects your experience. Importantly, you are not locked into your initial choice—you can change your cookie preferences at any time through the Settings section of your user profile. It is important to understand that essential cookies cannot be rejected, as they are strictly necessary for the System to function, including critical features like authentication, security protection, and the electoral voting system's fraud prevention mechanisms.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Browser settings provide another layer of cookie control</strong> for users who want to manage cookies at a technical level. Most modern web browsers allow you to control cookies through their settings interfaces. You can block all cookies entirely, though this approach will prevent you from using the System since essential cookies would be blocked. Many users choose to block third-party cookies only, allowing first-party cookies from Kyengera Parents' School - Mugongo while restricting cookies from external service providers. Some browsers offer options to delete cookies after each browsing session, ensuring no long-term tracking while still allowing session-based functionality. You can set exceptions for specific websites, allowing cookies from trusted domains while blocking others. Browser cookie management interfaces typically allow you to view and delete individual cookies, giving you precise control over what data is stored on your device. Each browser has its own cookie management process: Google Chrome users can navigate to Settings, then Privacy and Security, then Cookies and other site data; Mozilla Firefox users should go to Options, then Privacy & Security, then Cookies and Site Data; Safari users can access Preferences, then Privacy, then Manage Website Data; Microsoft Edge users should visit Settings, then Cookies and site permissions, then Manage and delete cookies.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Mobile device settings offer cookie control for smartphone and tablet users.</strong> If you access the Kyengera Parents' School - Mugongo School Portal through mobile devices, you have platform-specific options for cookie management. iOS Safari users can navigate to Settings, then Safari, then Block All Cookies to prevent all cookie storage. Android Chrome users should go to Settings, then Site Settings, then Cookies to configure their preferences. Each mobile browser has its own approach to cookie management, so we recommend checking your specific browser's help section for device-specific instructions tailored to your platform and browser combination.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Understanding the impact of rejecting cookies is crucial</strong> to making informed decisions about your privacy preferences. If you choose to reject or disable cookies, your ability to use various System features will be significantly affected. Authentication cookies are essential for logging in and maintaining your session, so disabling them means you cannot access the System at all. The electoral voting system relies on cookies to ensure voting integrity, and without them, the voting platform will not function properly. Your preferences and settings will not be saved between sessions, requiring you to reconfigure your interface preferences each time you log in. E-learning video progress tracking requires cookies, so your viewing history and resume points will not be maintained. Entertainment features depend on cookies to save viewing history and preferences, affecting content recommendations. Performance optimization relies on cookies to deliver smooth, fast experiences, so some features may load more slowly without them. Assignment submissions and other forms may lose data if you navigate away without cookies to preserve your work temporarily. Dashboard customizations will not persist between sessions, resetting to default layouts each time you log in. We strongly recommend accepting at least essential and functionality cookies to ensure a smooth, productive educational experience that supports rather than hinders your learning.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong>Opting out of analytics provides a middle ground</strong> for users who want to use the System fully while limiting data collection for improvement purposes. If you wish to opt out of analytics and performance tracking while still using all educational features, you have several options. The Cookie Consent Manager allows you to disable performance cookies specifically while keeping essential and functionality cookies enabled. Many modern browsers offer a "Do Not Track" setting that signals your preference against tracking to websites you visit. If you have specific concerns about analytics tracking, you may contact school administration to request individual exclusion from analytics data collection, though your usage will still be logged for security and compliance purposes. It is important to note that disabling analytics cookies will not affect your ability to access and use core educational features like assignments, grades, attendance tracking, or communications—it simply limits our ability to analyze aggregated usage patterns to improve the System for all users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Specific Cookie Details</h2>
            <p className="text-muted-foreground mb-4">
              Below is a detailed list of specific cookies used by the System:
            </p>

            <h3 className="text-lg font-semibold mb-3 mt-4">Essential Cookies</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>session_id:</strong> Maintains your logged-in session (expires when browser closes)</li>
              <li><strong>user_role:</strong> Stores your role (student/teacher/admin) for access control (persistent)</li>
              <li><strong>csrf_token:</strong> Security token to prevent cross-site request forgery (session)</li>
              <li><strong>auth_token:</strong> Encrypted authentication token (persistent, 30 days)</li>
              <li><strong>vote_token:</strong> Electoral system verification token (session, electoral period only)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 mt-4">Functionality Cookies</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>theme_preference:</strong> Light/dark mode selection (persistent, 1 year)</li>
              <li><strong>sidebar_state:</strong> Expanded/collapsed sidebar preference (persistent, 90 days)</li>
              <li><strong>dashboard_layout:</strong> Dashboard widget arrangement (persistent, 6 months)</li>
              <li><strong>filter_preferences:</strong> Saved search and filter settings (persistent, 30 days)</li>
              <li><strong>video_settings:</strong> E-learning video playback preferences (persistent, 90 days)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3 mt-4">Performance Cookies</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>analytics_session:</strong> Google Analytics session tracking (session)</li>
              <li><strong>performance_metrics:</strong> System performance measurement (persistent, 90 days)</li>
              <li><strong>feature_usage:</strong> Feature adoption tracking (persistent, 6 months)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Updates to Cookie Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Cookie Policy periodically to reflect changes in:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Cookie technologies and practices</li>
              <li>New System features requiring additional cookies</li>
              <li>Legal and regulatory requirements</li>
              <li>Third-party service integrations</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Material changes will be communicated through system notifications and email. The "Last Updated" date at the top of this policy indicates when it was most recently revised. We encourage you to review this policy periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about our use of cookies, please contact us at:<br /><br />
              Kyengera Parents' School - Mugongo<br />
              Kyengera Mugongo<br />
              Kampala, Uganda<br />
              Website: www.mugongo.sirapollokaggwaschools.co.ug<br />
              Phone: +256 753 616 792<br />
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}