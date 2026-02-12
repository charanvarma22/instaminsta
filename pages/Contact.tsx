import React from 'react';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
    return (
        <div className="bg-slate-950 pt-32 pb-24 min-h-screen">
            <SEO
                title="Contact Us"
                description="Get in touch with the instaminsta support team. We're here to help with your downloader questions."
                canonical="/contact"
            />
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-12 hero-text-gradient text-center">Contact Us</h1>

                <div className="max-w-xl mx-auto bg-slate-900/40 p-8 md:p-12 rounded-[3rem] border border-slate-800 shadow-2xl">
                    <p className="text-slate-400 text-center mb-10 font-medium">
                        Have a suggestion or experiencing an issue? Fill out the form below and our team will get back to you within 24 hours.
                    </p>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-2 ml-4">Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-pink-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-2 ml-4">Email Address</label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-pink-500/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-500 text-xs font-black uppercase tracking-widest mb-2 ml-4">Message</label>
                            <textarea
                                rows={4}
                                placeholder="How can we help?"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-pink-500/50 transition-all resize-none"
                            ></textarea>
                        </div>
                        <button className="w-full insta-gradient text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Send Message
                        </button>
                    </form>

                    <div className="mt-12 text-center text-slate-500 text-sm">
                        Or email us directly at: <br />
                        <span className="text-white font-bold">support@instaminsta.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
