import React from 'react';
import SEO from '../components/SEO';

const Terms: React.FC = () => {
    return (
        <div className="bg-slate-950 pt-32 pb-24 min-h-screen">
            <SEO
                title="Terms & Conditions"
                description="Terms and Conditions for using instaminsta's Instagram downloader service."
                canonical="/terms"
            />
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-12 hero-text-gradient">Terms of Service</h1>

                <div className="prose prose-invert prose-lg max-w-none text-slate-400 font-medium space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing instaminsta.com, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Permitted Use</h2>
                        <p>
                            Our tool is intended for personal, non-commercial use only. You are responsible for ensuring that you have the right to download and save the content you are accessing. We do not encourage copyright infringement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Intellectual Property</h2>
                        <p>
                            All trademarks, logos, and content on Instagram belong to their respective owners. instaminsta is not affiliated with, endorsed by, or sponsored by Instagram or Meta Platforms, Inc.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Limitation of Liability</h2>
                        <p>
                            instaminsta is provided "as is" without any warranties. We are not liable for any damages arising from the use or inability to use our tool. We do not guarantee 100% uptime.
                        </p>
                    </section>

                    <section className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800">
                        <p className="text-sm">Last updated: February 2026</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
