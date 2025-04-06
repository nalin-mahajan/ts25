import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">WhatsApp</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.56 0-3.03-.36-4.33-1.02L2 22l1.49-5.67A9.93 9.93 0 0 1 2 12 10 10 0 0 1 12 2zm0 1.89a8.11 8.11 0 0 0-8.11 8.11c0 1.77.58 3.43 1.57 4.77l.27.39-.99 3.79 3.79-.99.39.27a8.08 8.08 0 0 0 4.77 1.57 8.11 8.11 0 0 0 0-16.22zm4.32 11.65c-.18.28-1.03.67-1.43.7-.39.03-1.17.16-2.19-.46-.92-.62-1.54-1.13-2.09-2.05-.55-.92-.87-1.76-.96-2.31-.09-.55.39-1.23.57-1.44.18-.21.42-.24.57-.24l.39.01c.13 0 .3-.03.47.36.16.39.55 1.35.6 1.44.05.1.08.21.02.33-.06.12-.1.2-.2.31l-.3.37c-.1.12-.2.25-.09.48.12.23.54.97 1.16 1.56.8.77 1.48 1 1.68 1.12.21.12.33.1.45-.05.12-.15.51-.6.65-.81.13-.21.27-.17.45-.1.18.07 1.14.54 1.33.63.2.1.33.14.38.23.05.08.05.48-.13.76z" clipRule="evenodd"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1 flex flex-col md:flex-row md:items-center">
            <div className="text-center md:text-left">
              <p className="text-base text-gray-400">&copy; 2023 TrustFund. {t("footer.allRightsReserved")}</p>
            </div>
            <div className="flex justify-center md:ml-6 mt-4 md:mt-0 space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">{t("footer.privacy")}</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">{t("footer.terms")}</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">{t("footer.helpCenter")}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
