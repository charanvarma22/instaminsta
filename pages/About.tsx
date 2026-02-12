import React from 'react';
import SEO from '../components/SEO';

const About: React.FC = () => {
    return (
        <div className="bg-slate-950 pt-32 pb-24 min-h-screen">
            <SEO
                title="About Us"
                description="Learn about the mission behind instaminsta - the leading Instagram media downloader of 2026."
                canonical="/about"
            />
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-12 hero-text-gradient text-center">Our Mission</h1>

                <div className="prose prose-invert prose-lg max-w-none text-slate-400 font-medium space-y-12">
                    <div className="text-center text-2xl leading-relaxed text-slate-300">
                        instaminsta was founded in 2026 with a simple goal: <strong>To make social media content accessible to everyone, everywhere, without barriers.</strong>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 not-prose">
                        <div className="p-8 bg-slate-900/40 rounded-[2rem] border border-slate-800">
                            <div className="text-pink-500 font-bold mb-4">QUALITY</div>
                            <h3 className="text-xl font-bold text-white mb-3">Cinema-Grade Downloads</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">We utilize direct CDN streaming technology to ensure you get the exact video bitrate as the original creator uploaded.</p>
                        </div>
                        <div className="p-8 bg-slate-900/40 rounded-[2rem] border border-slate-800">
                            <div className="text-pink-500 font-bold mb-4">PRIVACY</div>
                            <h3 className="text-xl font-bold text-white mb-3">100% Zero-Log Policy</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Privacy isn't a feature; it's our foundation. We never track your downloads or demand your login credentials.</p>
                        </div>
                    </div>

                    <section className="text-center py-12">
                        <h2 className="text-3xl font-bold text-white mb-6">Built for the Modern Web</h2>
                        <p>
                            In a world of intrusive ads and complex subscriptions, instaminsta remains committed to simplicity. Our infrastructure is powered by cutting-edge server-side logic that scales to millions of users while maintaining lightning-fast response times.
                        </p>
                    </section>

                    <div className="p-1 w-full bg-gradient-to-r from-pink-500 to-orange-500 rounded-full opacity-20"></div>
                </div>
            </div>
        </div>
    );
};

export default About;
