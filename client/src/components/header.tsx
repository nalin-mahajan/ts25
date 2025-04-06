import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell, Menu, User, LogOut, Settings, CreditCard } from "lucide-react";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Navigate links with their paths and icons
  const navLinks = [
    { title: t("header.dashboard"), path: "/" },
    { title: t("header.loans"), path: "/loans" },
    { title: t("header.community"), path: "/community" },
    { title: t("header.learn"), path: "/learn" },
  ];

  // Check if user is authenticated
  if (!user) {
    return null; // Don't render header for unauthenticated users
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="text-primary font-bold text-2xl cursor-pointer">TrustFund</div>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a className={`${
                    location === link.path
                      ? "border-primary text-gray-900" 
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}
                  >
                    {link.title}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Right side items */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="icon" className="rounded-full text-gray-400">
                  <Bell className="h-5 w-5" />
                </Button>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </div>
              
              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white">
                        {user.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user.fullName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("header.profile")}</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/loans">
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>{t("header.myLoans")}</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("header.settings")}</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("header.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Language selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1 text-sm">
                    <span>{i18n.language === "en" ? "English" :
                          i18n.language === "hi" ? "हिंदी" :
                          i18n.language === "mr" ? "मराठी" :
                          i18n.language === "ta" ? "தமிழ்" : "English"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("hi")}>
                    हिन्दी (Hindi)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("mr")}>
                    मराठी (Marathi)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("ta")}>
                    தமிழ் (Tamil)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t("header.openMenu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle className="text-left text-primary text-2xl font-bold">TrustFund</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="flex items-center p-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-white">
                        {user.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto text-gray-400">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    {navLinks.map((link) => (
                      <Link key={link.path} href={link.path}>
                        <div 
                          className={`${
                            location === link.path 
                              ? "bg-primary-light bg-opacity-10 border-primary text-primary" 
                              : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                          } block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link href="/profile">
                      <div 
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t("header.profile")}
                      </div>
                    </Link>
                    <Link href="/profile">
                      <div 
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t("header.settings")}
                      </div>
                    </Link>
                    <div 
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {t("header.logout")}
                    </div>
                  </div>
                  
                  {/* Mobile language selector */}
                  <div className="mt-4 px-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">{t("header.language")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={i18n.language === "en" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleLanguageChange("en")}
                      >
                        English
                      </Button>
                      <Button 
                        variant={i18n.language === "hi" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleLanguageChange("hi")}
                      >
                        हिन्दी
                      </Button>
                      <Button 
                        variant={i18n.language === "mr" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleLanguageChange("mr")}
                      >
                        मराठी
                      </Button>
                      <Button 
                        variant={i18n.language === "ta" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleLanguageChange("ta")}
                      >
                        தமிழ்
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
