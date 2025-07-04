import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBasket, PhoneCall, Star, Users, ShieldCheck, CheckCircle, Badge, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { LoginOrRegisterForm } from '@/components/LoginOrRegisterForm';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Facebook, Google } from '@/components/ui/icons';

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof formSchema>;

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, signOut, userRole, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const authForm = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const userHomeUrl = `/feeds`;
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(userHomeUrl);
  };

  const handleAuthSuccess = async () => {
    navigate(userHomeUrl);
  };

  const onSocialAuthFormSubmit = useCallback(async (provider: 'google') => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: userHomeUrl,
        },
      });
    } catch (error) {
      console.error("Social Auth error:", error);
      toast.error("An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function onAuthFormSubmit(values: AuthFormValues) {
    setIsLoading(true);
    const { email, password } = values;

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error("Invalid credentials. Please check your email and password.");
          return;
        }
        toast.success("Successfully signed in!");
        handleAuthSuccess();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          toast.error(signUpError.message?.includes("already") ? "Account already exists. Try signing in instead." : signUpError.message);
          return;
        }
        toast.success("Account created! Please check your email for verification.");
        navigate("/interest-selection", {
          replace: true,
          state: { email }
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  }

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    authForm.reset();
  };

  const handleBackToSocial = () => {
    setShowEmailForm(false);
    authForm.reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SEO
        title="Login | MeetnMart"
        description="Shop locally and connect face-to-face with sellers through video calls. MeetnMart revolutionizes local commerce."
        keywords="login, sign in, authentication, local marketplace, video calls, face-to-face shopping, local commerce, buyer login, seller login, secure login, marketplace login"
        ogType="website"
        ogUrl="https://meetnmart.com/getting-started"
        canonical="https://meetnmart.com/getting-started"
      />

      <main className="flex-grow flex flex-col animate-fade-in">
        <div className="px-4 pt-8 pb-12 md:pt-12 md:pb-16 max-w-md mx-auto w-full text-center">
          <div className="mb-6 relative">
            <div className="w-full flex items-center justify-center">
              <Logo containerClassName="w-16 h-16 "/>
            </div>

            <span
      className={cn(
        "text-[10px] uppercase font-semibold rounded-full border text-market-orange bg-orange-100 dark:bg-orange-900/30",
      "absolute bottom-2 right-[42%] md:right-[44%] bg-market-orange text-white font-bold px-2" )}
    >
      Beta
    </span>
            {/* <Beta className="ml-2 bg-background/50 absolute top-0 right-0 border-market-orange" /> */}
          </div>
          <p className="text-lg text-muted-foreground mb-8">
  Negotiate in real-time. Shop local like never before.
</p>
          <div className="glass-morphism p-6 rounded-xl mb-8">
            {!isAuthenticated ? (
              <div className="space-y-4">
                {!showEmailForm ? (
                  // Social Auth Section
                  <>
                    <div className="space-y-4">
                      <SocialAuthButtons 
                        onAuthRequested={onSocialAuthFormSubmit} 
                        isLoading={isLoading} 
                        providers={[{name: 'google', icon: Google}, {icon: Facebook, name: 'facebook'}]} 
                      />
                      
                      <Button
                        disabled={isLoading}
                        variant="outline"
                        onClick={() => setShowAuthModal(true)}
                        className="w-full bg-secondary/50 border-none"
                      >
                        <PhoneCall className="mr-2 h-4 w-4" />
                        Continue with Phone
                      </Button>

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="px-2 text-muted-foreground bg-background">
                            Or
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setShowEmailForm(true)}
                        className="w-full bg-secondary/50 border-none"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Continue with Email
                      </Button>
                    </div>
                  </>
                ) : (
                  // Email Form Section
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">
                        {authMode === 'login' ? 'Welcome back' : 'Create account'}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToSocial}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ← Back
                      </Button>
                    </div>

                    <Form {...authForm}>
                      <form onSubmit={authForm.handleSubmit(onAuthFormSubmit)} className="space-y-4">
                        <div className="space-y-4">
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                              {...authForm.register('email')}
                              type="email"
                              placeholder="Email address"
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-market-orange focus:border-transparent"
                            />
                            {authForm.formState.errors.email && (
                              <p className="text-sm text-red-500 mt-1">
                                {authForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>

                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                              {...authForm.register('password')}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Password"
                              className="w-full pl-10 pr-12 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-market-orange focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            {authForm.formState.errors.password && (
                              <p className="text-sm text-red-500 mt-1">
                                {authForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-market-orange hover:bg-market-orange/90 py-3"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                        </Button>
                      </form>
                    </Form>

                    <div className="text-center mt-6">
                      <p className="text-sm text-muted-foreground">
                        {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button
                          onClick={toggleAuthMode}
                          className="ml-1 text-market-orange hover:underline font-medium"
                        >
                          {authMode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                      </p>
                    </div>
                  </>
                )}

                {!showEmailForm && (
                  <div className="mt-6 text-sm text-muted-foreground text-center">
                    <p>Test credentials: +15086842093, OTP: 123456</p>
                  </div>
                )}
              </div>
            ) : (
              // Authenticated User Section
              <div className="space-y-3">
                <Button
                  disabled={isLoading}
                  size="lg"
                  onClick={handleGetStarted}
                  className="w-full bg-market-orange hover:bg-market-orange/90"
                >
                  <ShoppingBasket className="mr-2 h-4 w-4" />
                  Browse Markets
                </Button>

                <Button
                  disabled={isLoading}
                  variant="outline"
                  onClick={signOut}
                  className="w-full bg-secondary/50 border-none"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 px-6 text-center text-xs text-muted-foreground">
        <p>© 2025 MeetnMart. All rights reserved.</p>
        <p className="mt-1">Connecting local buyers and sellers safely.</p>
      </footer>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;

// import { useCallback, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { ArrowRight, ShoppingBasket, PhoneCall, Star, Users, ShieldCheck, CheckCircle, Badge } from 'lucide-react';
// import AuthModal from '@/components/AuthModal';
// import { useAuth } from '@/contexts/AuthContext';
// import { SocialAuthButtons } from '@/components/SocialAuthButtons';
// import SEO from '@/components/SEO';
// import { Card, CardContent } from '@/components/ui/card';
// import Logo from '@/components/Logo';
// import { toast } from 'sonner';
// import { Form } from '@/components/ui/form';
// import { LoginOrRegisterForm } from '@/components/LoginOrRegisterForm';
// import { z } from 'zod';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { supabase } from '@/integrations/supabase/client';
// import { useQueryClient } from '@tanstack/react-query';


// const formSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

// type AuthFormValues = z.infer<typeof formSchema>;

// const Index = () => {
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const { user, signOut, userRole, isAuthenticated } = useAuth();
//   const [isLoading, setIsloading] = useState<boolean>(false);
//   const [flow, setFlow] = useState<"signup" | "signin">("signup")


//   const authForm = useForm<AuthFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const userHomeUrl = `/feeds`
//   // const userHomeUrl = userRole ? `/feeds` : "/role-selection"

//   const navigate = useNavigate();

//   const handleGetStarted = () => {
//     navigate(userHomeUrl);
//   };

//   const handleAuthSuccess = async () => {
//      navigate(userHomeUrl)
//   };

//   const onSocialAuthFormSubmit = useCallback(async (provider: 'google') => {
//     setIsloading(true)
//     try {
//       await supabase.auth.signInWithOAuth({
//         provider,
//         options: {
//           // skipBrowserRedirect: true,
//           redirectTo: userHomeUrl,
//         },
//       });
//     } catch (error) {
//       console.error("Social Auth error:", error);
//       toast.error("An error occurred during authentication");
//     } finally {
//       setIsloading(false)
//     }
//   }, []);

//   async function onAuthFormSubmit(values: AuthFormValues) {
//     // try {
//       setIsloading(true)
//       const { email, password } = values;

//       // Attempt to sign in
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         // If sign in fails, try to sign up
//         const { error: signUpError } = await supabase.auth.signUp({
//           email,
//           password,
//         });

//         if (signUpError) {
//           toast.error(signUpError.message?.includes("already") ? "Invalid Credentials": signUpError.message);
//           return;
//         }
//         toast.success("Account created! Please check your email for more details.");

//         setFlow("signup")
//         navigate("/interest-selection", {
//           replace: true,
//           state: {
//             email
//           }
//         })
//       } else {
//         toast.success("Successfully signed in!");
//         setFlow("signin")
//         handleAuthSuccess();
//       }

//       setIsloading(false)
//     // } catch (error) {
//     //   console.error("Auth error:", error);
//     //   toast.error("An error occurred during authentication");
//     // } finally {
//     //   setIsloading(false)
//     // }
//   }

//   return (
//     <div className="flex flex-col min-h-screen bg-background">
//       <SEO
//         title="Login | MeetnMart"
//         description="Shop locally and connect face-to-face with sellers through video calls. MeetnMart revolutionizes local commerce."
//         keywords="login, sign in, authentication, local marketplace, video calls, face-to-face shopping, local commerce, buyer login, seller login, secure login, marketplace login"
//         ogType="website"
//         ogUrl="https://meetnmart.com/getting-started"
//         canonical="https://meetnmart.com/getting-started"
//       />

//       {/* Hero Section */}
//       <main className="flex-grow flex flex-col animate-fade-in">
//         <div className="px-4 pt-8 pb-12 md:pt-12 md:pb-16 max-w-md mx-auto w-full text-center">
//           <div className="mb-6 relative">
//             <div className="w-full flex items-center justify-center">
//               <Logo />
//             </div>
//             <Badge className="ml-2 bg-background/50 absolute top-0 right-0 border-market-orange " />
//           </div>


//           {/* Value Proposition */}
//           <p className="text-lg text-muted-foreground mb-8">
//             Connect with local sellers through live video calls before you buy
//           </p>

//           <div className="glass-morphism p-6 rounded-xl mb-8">
//             <div className="grid gap-4">
//               {!isAuthenticated &&
//                 (
//                   <>
//                     <SocialAuthButtons onAuthRequested={onSocialAuthFormSubmit} isLoading={isLoading} providers={['google']} />
//                     <Button disabled={isLoading}
//                       variant="outline"
//                       onClick={() => setShowAuthModal(true)}
//                       className="bg-secondary/50 border-none"
//                     >
//                       <PhoneCall className="mr-2 h-4 w-4" />
//                       Continue with Phone
//                     </Button>

//                     <div className="relative my-2">
//                       <div className="absolute inset-0 flex items-center">
//                         <span className="w-full border-t " />
//                       </div>
//                       <div className="relative flex justify-center text-xs uppercase">
//                         <span className="px-2 text-muted-foreground">
//                           Or continue with
//                         </span>
//                       </div>
//                     </div>

//                     <Form {...authForm}>
//                       <form onSubmit={authForm.handleSubmit(onAuthFormSubmit)} className="space-y-6">
//                         <LoginOrRegisterForm form={authForm} />


//                         <Button
//                           type="submit"
//                           className="w-full bg-market-orange hover:bg-market-orange/90"
//                           disabled={authForm.formState.isSubmitting}
//                         >
//                           {authForm.formState.isSubmitting ? 'Authenticating...' : 'Sign In/Sign Up'}
//                         </Button>
//                       </form>
//                     </Form>
//                   </>
//                 )}




//               {
//                 isAuthenticated && (
//                   <>
//                     <Button disabled={isLoading}
//                       size="lg"
//                       onClick={handleGetStarted}
//                       className="bg-market-orange hover:bg-market-orange/90"
//                     >
//                       <ShoppingBasket className="mr-2 h-4 w-4" />
//                       Browse Markets
//                     </Button>

//                     <Button disabled={isLoading}
//                       variant="outline"
//                       onClick={signOut}
//                       className="bg-secondary/50 border-none"
//                     >
//                       Sign Out
//                     </Button>

//                   </>
//                 )}

//             </div>

//             <div className="mt-8 text-sm text-muted-foreground text-center">
//               <p>Test credentials: +15086842093, OTP: 123456</p>
//             </div>
//           </div>

       
//         </div>
//       </main >

//       {/* Footer */}
//       <footer className="py-4 px-6 text-center text-xs text-muted-foreground" >
//         <p>© 2025 MeetnMart. All rights reserved.</p>
//         <p className="mt-1">Connecting local buyers and sellers safely.</p>
//       </footer>

//       <AuthModal
//         open={showAuthModal}
//         onOpenChange={setShowAuthModal}
//         onSuccess={handleAuthSuccess}
//       />
//     </div>
//   );
// };

// export default Index;
