import React from 'react';
import SEO from '../components/SEO';

const Privacy: React.FC = () => {
    return (
        <div className="bg-slate-950 pt-32 pb-24 min-h-screen">
            <SEO
                title="Privacy Policy"
                description="Privacy Policy for instaminsta. Learn how we handle your data and ensure your anonymity while downloading Instagram media."
                canonical="/privacy"
            />
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-12 hero-text-gradient">Privacy Policy</h1>

                <div className="prose prose-invert prose-lg max-w-none text-slate-400 font-medium space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Data Collection</h2>
                        <p>
                            instaminsta does not require any user registration or login. We do not collect personal identification information like names, email addresses, or phone numbers. Our service is designed to be 100% anonymous.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Cookies</h2>
                        <p>
                            We use small text files called cookies to improve your browsing experience and analyze site traffic via third-party tools like Google Analytics. You can disable cookies in your browser settings at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Instagram Data</h2>
                        <p>
                            instaminsta acts as a bridge between you and the public Instagram CDN. We do not store any media files on our servers. All downloads are streamed directly from the source to your device. We do not keep logs of which URLs you download.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Third Parties</h2>
                        <p>
                            We may display advertisements from third-party networks (like Google AdSense). These advertisers may use cookies to serve ads based on your visit to this and other sites.
                        </p>
                    </section>

                    <section className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800">
                        <h2 className="text-xl font-bold text-white mb-2">Contact Us</h2>
                        <p className="text-sm">If you have any questions about this Privacy Policy, please contact us at support@instaminsta.com</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
