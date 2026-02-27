import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import logo from "../../../assets/logo.png";

export function SplashScreen() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if splash was already shown in this session
    const splashShown = sessionStorage.getItem("splash_shown");
    
    if (splashShown === "true") {
      // Splash already shown, skip animation and redirect immediately
      const onboardingCompleted = localStorage.getItem("onboarding_completed");
      
      if (onboardingCompleted === "true") {
        navigate("/login", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
      return;
    }

    // Mark splash as shown for this session
    sessionStorage.setItem("splash_shown", "true");

    // Start fade out after 1.3s (0.8s animation + 0.5s wait)
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1300);

    // Navigate after fade out completes
    const navigateTimer = setTimeout(() => {
      // Check if onboarding is completed
      const onboardingCompleted = localStorage.getItem("onboarding_completed");
      
      if (onboardingCompleted === "true") {
        // Go to login if onboarding is done
        navigate("/login", { replace: true });
      } else {
        // Go to onboarding if first time
        navigate("/onboarding", { replace: true });
      }
    }, 1800); // 1.3s + 0.5s fade out

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-background via-background to-coral/5 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {!fadeOut && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scale: { duration: 0.8, ease: "easeOut" },
              opacity: { duration: fadeOut ? 0.5 : 0.8, ease: "easeOut" },
            }}
            className="flex items-center justify-center"
          >
            <img 
              src={logo} 
              alt="YourMoody Logo" 
              className="w-64 h-auto"
              style={{ mixBlendMode: 'normal' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
