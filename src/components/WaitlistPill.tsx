import React, { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from '@/lib/supabaseClient';
import SparkleConfetti from './SparkleConfetti';

const gradient =
  "bg-gradient-to-br from-[#16162a] via-[#241128] to-[#272c41]";
const glassStyles = `
  bg-white/5
  backdrop-blur-lg
  border border-white/15
`;

const WaitlistPill: React.FC = () => {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      // Log the exact request we're about to make
      console.log('Making Supabase request with:', {
        table: 'waitlist',
        data: { email }
      });

      // Make the request
      const response = await supabase
        .from('waitlist')
        .insert({ email });

      // Log the full response
      console.log('Full Supabase response:', response);

      if (response.error) {
        console.error('Supabase error:', {
          message: response.error.message,
          details: response.error.details,
          hint: response.error.hint,
          code: response.error.code
        });
        toast.error("Failed to join waitlist. Please try again.");
        return;
      }

      setJoined(true);
      setShowConfetti(true);
      setEmail("");
      setTimeout(() => setShowConfetti(false), 800);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        relative flex flex-col sm:flex-row items-center gap-4 sm:gap-0 justify-center
        px-6 py-5 sm:py-4 w-full max-w-xl mx-auto
        rounded-3xl shadow-2xl
        ring-1 ring-white/10
        ${glassStyles}
        ${gradient}
        animate-fade-in
        group transition-all duration-500
        border border-[#44415c]
        overflow-hidden
      `}
      style={{
        boxShadow:
          "0 8px 44px 0 #15122b7a, 0 3px 18px 0 #ea51af34, 0 0px 2px 0 #30cacb34",
        border: "1.8px solid rgba(68,65,92,0.45)",
        backdropFilter: "blur(10px)",
      }}
    >
      <span className="flex items-center gap-2 pr-0 sm:pr-6 text-white text-lg font-semibold drop-shadow-lg">
        <span className="font-semibold drop-shadow-[0_1px_3px_#ea51af50] tracking-tight">
          Join the Waitlist
        </span>
      </span>

      {!joined ? (
        <form
          className="flex w-full sm:w-auto items-center gap-2 transition-all"
          onSubmit={handleJoin}
        >
          <input
            className="
              flex-1 sm:w-64 bg-[#212033]/80 placeholder:text-white/95 focus:bg-white/10
              py-2.5 px-5 rounded-full outline-none
              text-white shadow-inner font-medium
              focus:ring-2 focus:ring-[#ea51afbb] focus:border-[#a78bfa]
              border border-[#9177ef88]
              backdrop-blur-sm
              transition
              placeholder:italic
              placeholder:font-normal
              hover:border-[#7e6aff]
              focus:shadow-[0_0_16px_0_rgba(234,81,175,0.2)]
            "
            type="email"
            placeholder="you@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            aria-label="Email address for waitlist"
            aria-required="true"
            aria-invalid={email !== "" && !email.includes("@")}
            onInvalid={(e) => {
              e.preventDefault();
              const input = e.target as HTMLInputElement;
              if (input.validity.valueMissing) {
                input.setCustomValidity("Join the waitlist to be first in line!");
              } else if (input.validity.typeMismatch) {
                input.setCustomValidity("Please enter a valid email address");
              }
            }}
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              input.setCustomValidity("");
            }}
            style={{
              color: "#fff",
              fontWeight: 500,
              letterSpacing: 0.2,
            }}
          />
          <button
            type="submit"
            className={`
              bg-gradient-to-br from-[#ff65d3] via-[#7e6aff] to-[#30cfd0]
              text-white font-bold flex items-center justify-center
              px-7 py-2.5 rounded-full shadow-xl
              text-lg group-hover:scale-105
              hover:shadow-[0_0_16px_0_rgba(255,101,211,0.34)]
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7e6aff]
              border border-[#cba8fe70]
              transition-all duration-150
              relative
              hover:from-[#7e6aff] hover:via-[#30cfd0] hover:to-[#ff65d3]
              disabled:bg-[#312950] disabled:text-gray-400
            `}
            disabled={loading}
            style={{
              minWidth: 104,
            }}
          >
            {loading ? (
              <span className="animate-spin inline-block">
                <svg className="w-6 h-6 text-[#ff65d3]" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              </span>
            ) : (
              <>
                Join
                <ArrowRight
                  className="ml-1 -mr-0.5"
                  size={22}
                  strokeWidth={2.4}
                  color="#fff"
                />
              </>
            )}
          </button>
        </form>
      ) : (
        <span className="flex relative min-h-[44px] items-center gap-2 pl-0 sm:pl-6 text-white text-base font-semibold animate-fade-in select-none">
          <CheckCircle2 className="text-[#59fad7] drop-shadow-md" size={26} />
          <span className="font-semibold animate-fade-in whitespace-nowrap">
            You're in! <span aria-hidden>🎉</span>
          </span>
          {showConfetti && <SparkleConfetti />}
        </span>
      )}
      {/* Subtle neon/pulse border glow */}
      <span
        className="absolute -inset-[3px] rounded-full pointer-events-none z-0 blur-[4px] opacity-90 animate-pulse"
        style={{
          background:
            "radial-gradient(ellipse at 60% 60%, #ea51af55 0%, #7e6aff55 40%, transparent 85%)",
        }}
      ></span>
    </div>
  );
};

export default WaitlistPill; 