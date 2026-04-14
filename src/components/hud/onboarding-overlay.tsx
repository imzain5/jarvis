"use client";

import { AnimatePresence, motion } from "motion/react";

import { ONBOARDING_STEPS } from "@/lib/constants";

type OnboardingOverlayProps = {
  open: boolean;
  onCalibrate: () => void;
  onSkip: () => void;
};

export function OnboardingOverlay({ open, onCalibrate, onSkip }: OnboardingOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-40 flex items-end justify-center px-6 pb-10 sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="hud-glass max-w-2xl rounded-[2rem] border border-cyan-200/16 p-6 sm:p-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-soft">Onboarding</p>
            <h2 className="font-display mt-3 text-2xl tracking-[0.08em] text-white">
              Learn the control language in under a minute.
            </h2>
            <div className="mt-6 grid gap-3">
              {ONBOARDING_STEPS.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm leading-6 text-soft"
                >
                  <span className="mr-3 font-display text-cyan-100">{`0${index + 1}`}</span>
                  {step}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCalibrate}
                className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-5 py-3 text-xs uppercase tracking-[0.32em] text-white transition hover:border-cyan-200/46"
              >
                Start Calibration
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="rounded-full border border-white/10 bg-black/20 px-5 py-3 text-xs uppercase tracking-[0.32em] text-soft transition hover:border-white/24 hover:text-white"
              >
                Skip for Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
