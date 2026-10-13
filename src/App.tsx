import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Home from "./pages/Home.tsx";
import Legal from "./pages/Legal.tsx";
import Designs from "@/pages/Designs.tsx";
import About from "@/pages/About.tsx";
import FAQ from "@/pages/FAQ.tsx";

export default function App() {
    const getPage = () => {
        const path = window.location.pathname;
        if (path.startsWith("/designs/")) return "designs";
        if (path === "/legal") return "legal";
        if (path === "/about") return "about";
        if (path === "/faq") return "faq";
        return "home";
    };

    const [opened, setOpened] = useState<string>(getPage);
    const [designRoute, setDesignRoute] = useState(window.location.pathname);

    useEffect(() => {
        const handlePopState = () => {
            setOpened(getPage());
            setDesignRoute(window.location.pathname);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const navigate = (page: string) => {
        const paths: Record<string, string> = { home: "/", designs: "/designs", legal: "/legal", about: "/about", faq: "/faq" };
        window.history.pushState({}, "", paths[page]);
        setOpened(page);
        setDesignRoute(window.location.pathname);
        window.scrollTo(0, 0);
    };

    const isDesignDetail = designRoute.startsWith("/designs/") && designRoute !== "/designs/";

    return (
        <div className="w-full h-fit flex flex-col">
            {!isDesignDetail && (
                <div className="w-full z-50 h-fit flex flex-row items-center gap-3.5 bg-black/50 backdrop-blur-2xl sticky top-0 p-3 border-b border-white/8">
                    <Icon icon="boxicons:blanket-filled" width={30} height={30} color="white" />
                    <div className="w-fit h-fit flex flex-row gap-2 items-center">
                        {[
                            ["home", "Home"],
                            ["designs", "Designs"],
                            ["legal", "Legal"],
                            ["about", "About"],
                            ["faq", "FAQ"],
                        ].map(([page, label]) => (
                            <motion.button key={page} initial={{ opacity: 1 }} whileHover={{ opacity: 0.7 }} onClick={() => navigate(page)} className="w-fit h-fit flex flex-col items-center justify-center p-1.5 cursor-pointer">
                                <h3 className={opened === page ? "text-white" : "text-white/60"}>{label}</h3>
                            </motion.button>
                        ))}
                    </div>
                    <div className="w-full items-center flex flex-row justify-end">
                        <motion.button initial={{ opacity: 1 }} whileHover={{ opacity: 0.7 }} onClick={() => { navigate("home"); window.location.hash = "contact-us"; }} className="w-fit h-fit bg-white/10 border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 flex flex-col items-center rounded-md justify-center p-2 cursor-pointer">
                            <h3 className="text-white text-sm">Contact Us</h3>
                        </motion.button>
                    </div>
                </div>
            )}
            <div className="w-full h-full flex flex-col items-center justify-center">
                {opened === "home" ? <Home /> : opened === "legal" ? <Legal /> : opened === "designs" ? <Designs /> : opened === "about" ? <About /> : opened === "faq" ? <FAQ /> : null}
            </div>
        </div>
    );
}