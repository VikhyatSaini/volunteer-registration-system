import { useState } from 'react';
import { Mail, MessageCircle, ChevronDown, ChevronUp, Send, Loader2, HelpCircle, LifeBuoy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import toast from 'react-hot-toast';

const faqs = [
  { 
    question: "How do I log my volunteer hours?", 
    answer: "Navigate to 'My History' in the sidebar menu. Use the 'Log New Hours' form on the left side to select the event you attended, the date, and the duration. Once submitted, it will be sent for admin approval." 
  },
  { 
    question: "How can I update my profile picture?", 
    answer: "Click on your avatar in the top-right corner or select 'Settings' from the sidebar. In the Profile page, hover over your current picture and click the camera icon to upload a new photo." 
  },
  { 
    question: "What happens if my hours are rejected?", 
    answer: "If an admin rejects your hours, the status will change to 'Rejected' in your history table. You can use the contact form on this page to appeal the decision or ask for clarification." 
  },
  { 
    question: "Can I cancel my event registration?", 
    answer: "Currently, you cannot cancel directly from the dashboard. Please contact the event organizer directly or send us a message here with the event details." 
  },
];

const Support = () => {
  const [openFaq, setOpenFaq] = useState(0); // First one open by default
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent! We'll get back to you shortly.");
      e.target.reset();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-10"
    >
      
      {/* 1. Colorful Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        {/* Floating Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white/90 text-xs font-medium mb-3">
                <Sparkles size={12} className="text-yellow-300" /> Help Center
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
               How can we <br/> help you today?
             </h1>
             <p className="text-indigo-100 mt-3 text-lg max-w-lg font-medium">
               Browse our common questions or reach out to our support team directly.
             </p>
          </div>
          {/* Hero Icon */}
          <div className="hidden md:flex h-32 w-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-full items-center justify-center shadow-2xl">
             <LifeBuoy size={64} className="text-white animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* 2. FAQ Section (Left - 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
               <HelpCircle className="text-indigo-400" size={22} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white">Common Questions</h2>
               <p className="text-xs text-slate-400">Quick answers to frequently asked questions.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index} 
                initial={false}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'bg-slate-900/80 border-indigo-500/50 shadow-lg shadow-indigo-900/10' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className={`font-semibold transition-colors ${openFaq === index ? 'text-indigo-300' : 'text-slate-200'}`}>
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-full transition-all duration-300 ${openFaq === index ? 'bg-indigo-500/20 rotate-180' : 'bg-slate-800'}`}>
                    <ChevronDown size={16} className={openFaq === index ? 'text-indigo-400' : 'text-slate-400'} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-sm text-slate-400 leading-relaxed border-t border-indigo-500/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. Contact Form (Right - 5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl sticky top-24 relative overflow-hidden">
            {/* Background Gradient Spot */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                 <Mail className="text-pink-400" size={20} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-white">Contact Support</h2>
                 <p className="text-xs text-slate-400">We usually respond within 24 hours.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="e.g. Issue with hour approval" 
                  className="bg-slate-950/80 border-slate-700 text-white focus:border-pink-500/50 focus:ring-pink-500/20 transition-all" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-300">Message</Label>
                <textarea 
                  id="message" 
                  rows="5"
                  className="flex w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/20 focus-visible:border-pink-500/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                  placeholder="Describe your issue in detail..." 
                  required
                />
              </div>

              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-lg shadow-indigo-900/20 mt-2 transition-all hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Message
              </Button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
               <p className="text-xs text-slate-500">
                  Prefer email? Reach us at <a href="#" className="text-indigo-400 hover:underline">support@rallypoint.com</a>
               </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Support;