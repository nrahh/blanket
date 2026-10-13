import {LiquidButton} from "@/components/animate-ui/components/buttons/liquid.tsx";
import "./Home.css"
import "../fontService.css"
import {motion} from "motion/react";
import DispersionBands from "@/meshh/components/dispersion-bands/DispersionBands";
import {useState} from "react";
import {Icon} from '@iconify/react'

import image1 from "../assets/display_images/image1.png"
import image2 from "../assets/display_images/image2.png"
import image3 from "../assets/display_images/image3.png"

import selaura from "../assets/workedwith/selaura.png"

const images = [
    image1,
    image2,
    image3
];

const workedWithArray = {
    selaura: {
        name: "selaura",
        icon: selaura,
    },
};

export default function Home() {

    const [currentImg, setCurrentImg] = useState<number>(0);

    // @ts-ignore
    function handleIdSwitch(negativeChange: boolean) {
        setCurrentImg((current) => {
            if (negativeChange) {
                return (current - 1 + images.length) % images.length;
            }

            return (current + 1) % images.length;
        });
    }

    return (
        <div className="w-full h-full flex flex-col items-center pt-30">
            {/*hero*/}
            <section className="w-full h-fit flex flex-col items-center justify-center">
                <div className="w-fit h-fit flex flex-col items-center z-10">
                    <motion.h1 initial={{ opacity: 0, y: -20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ duration: 0.3, ease: "easeInOut" }} className="zalando text-white text-[80px] text-center font-semibold">Blanket</motion.h1>
                    <motion.h3 initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ duration: 0.55, ease: "easeInOut" }} className="text-white/35 text-center max-w-90 -mt-3.5">We have been crafting modern user interfaces since 2020.</motion.h3>

                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.5}} className="w-full h-fit flex flex-row pt-8 gap-2">
                        <div className="w-full flex flex-col">
                            <LiquidButton className="cursor-pointer" id="contact-us" >Contact Us</LiquidButton>
                        </div>
                        <div className="w-full flex flex-col">
                            <LiquidButton className="cursor-pointer" id="designs" variant="secondary">Designs</LiquidButton>
                        </div>
                    </motion.div>
                </div>
                <div
                    className="pointer-events-none absolute inset-x-0 inset-y-0 flex w-full flex-col opacity-60"
                    style={{
                        maskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 85%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 20%, transparent 85%)",
                    }}
                >
                    <DispersionBands
                        seed={85}
                        lensScale={3.8}
                        lensSpacing={1.15}
                        lensRadius={0.7}
                        dispersion={0}
                        edgeDispersion={0.8}
                        colorA="#020617"
                        colorB="#102A83"
                        colorC="#1677FF"
                    />
                </div>
            </section>

            <section className="w-full h-fit flex flex-col items-center justify-center z-10 pt-50 gap-5">
                <div className="w-full flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />

                    <h1 className="relative z-10 text-white text-xl font-medium text-center px-2">
                        Why Choose Us
                    </h1>

                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="w-fit h-fit flex flex-col gap-3 justify-center">
                    <motion.div
                        initial={{ opacity: 1, scale: 1 }}
                        whileHover={{ opacity: 0.7, scale: 0.98 }}
                        className="cursor-pointer w-full h-fit flex flex-col items-start bg-white/2 p-6 rounded-xl border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 gap-2"
                    >
                        <div className="w-fit h-fit flex flex-row gap-3 items-center">
                            <Icon icon="andrsrxn:brain" width={23} height={23} color="white" />
                            <h3 className="text-left text-lg text-white">Creative Thinking</h3>
                        </div>
                        <p className="text-white/38">
                            Fresh ideas that turn ambitious concepts into standout digital experiences.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 1, scale: 1 }}
                        whileHover={{ opacity: 0.7, scale: 0.98 }}
                        className="cursor-pointer w-full h-fit flex flex-col items-start bg-white/2 p-6 rounded-xl border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 gap-2"
                    >
                        <div className="w-fit h-fit flex flex-row gap-3 items-center">
                            <Icon icon="akar-icons:calendar" width={23} height={23} color="white" />
                            <h3 className="text-left text-lg text-white">Years of Experience</h3>
                        </div>
                        <p className="text-white/38">
                            We've been designing modern user interfaces for over 6 years.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 1, scale: 1 }}
                        whileHover={{ opacity: 0.7, scale: 0.98 }}
                        className="cursor-pointer w-full h-fit flex flex-col items-start bg-white/2 p-6 rounded-xl border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 gap-2"
                    >
                        <div className="w-fit h-fit flex flex-row gap-3 items-center">
                            <Icon icon="andrsrxn:brain" width={23} height={23} color="white" />
                            <h3 className="text-left text-lg text-white">We Keep It Consistent</h3>
                        </div>
                        <p className="text-white/38">
                            Consistent design throughout and no unnecessary clutter.
                        </p>
                    </motion.div>
                </div>

            </section>

            <section className="w-full h-fit flex flex-col items-center justify-center z-10 pt-25 gap-5">
                <div className="w-full flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />

                    <h1 className="relative z-10 text-white text-xl font-medium text-center px-2">
                        Take A Peek
                    </h1>

                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="w-fit max-w-full h-fit flex flex-row bg-white/2 p-2 sm:p-5 rounded-xl border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 items-center gap-2 sm:gap-7">
                    <motion.button initial={{opacity: 1}} whileHover={{opacity: 0.7}}
                                   onClick={() => setCurrentImg((currentImg - 1 + images.length) % images.length)}
                                   className="shrink-0 p-2 sm:p-3 flex items-center justify-center bg-white/10 rounded-4xl cursor-pointer"
                    >
                        <Icon icon="akar-icons:chevron-left" width={25} height={25} color="white" />
                    </motion.button>

                    <div className="w-[min(600px,55vw)] h-[min(400px,55vw)] sm:w-150 sm:h-100 shrink min-w-0 flex items-center justify-center">
                        <img
                            src={images[currentImg]}
                            alt="design preview"
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                        />
                    </div>

                    <motion.button initial={{opacity: 1}} whileHover={{opacity: 0.7}}
                                   onClick={() => setCurrentImg((currentImg + 1) % images.length)}
                                   className="shrink-0 p-2 sm:p-3 flex items-center justify-center bg-white/10 rounded-4xl cursor-pointer"
                    >
                        <Icon icon="akar-icons:chevron-right" width={25} height={25} color="white" />
                    </motion.button>
                </div>
            </section>

            <section className="w-full h-fit flex flex-col items-center justify-center z-10 pt-25 gap-5">
                <div className="w-full flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />

                    <h1 className="relative z-10 text-white text-xl font-medium text-center px-2">
                        What We Do
                    </h1>

                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <p className="text-white/38 text-center max-w-160">We design and create user interfaces (UI). We create user interfaces first in Figma, then after we are done creating it in Figma we recreate that design in React, turning them into fully functional websites.</p>

                <h5 className="text-center text-white/25 uppercase font-medium">Our Workflow</h5>
                
                <div className="w-fit h-fit flex flex-row gap-5 items-center">
                    <Icon icon="simple-icons:figma" width={28} height={28} color="white" />
                    <Icon icon="lucide:arrow-right" width={22} height={22} color="#666666" />
                    <Icon icon="simple-icons:react" width={32} height={32} color="white" />
                    <Icon icon="lucide:arrow-right" width={18} height={18} color="#666666" />
                    <Icon icon="lucide:globe" width={32} height={32} color="white" />
                </div>
            </section>

            <section className="w-full h-fit flex flex-col items-center justify-center z-10 pt-15 gap-5">
                <div className="w-full flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />

                    <h1 className="relative z-10 text-white text-xl font-medium text-center px-2">
                        Who've We Worked With
                    </h1>

                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="w-fit h-fit flex flex-wrap justify-center mx-auto p-2 gap-2">
                    {Object.values(workedWithArray).map((partner) => (
                        <div key={partner.name} className="w-fit h-fit flex flex-row items-center gap-2 bg-white/8 p-3 rounded-lg border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10"
                        >
                            <img src={partner.icon} alt={partner.name} className="object-center w-10 rounded-md"
                            />
                            <h3 className="text-white text-lg">{partner.name}</h3>
                        </div>
                    ))}
                </div>
            </section>

            <section id="contact-us" className="w-full h-fit flex flex-col items-center justify-center z-10 pt-25 gap-5">
                <div className="w-full flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />

                    <h1 className="relative z-10 text-white text-xl font-medium text-center px-2">
                        Contact Us
                    </h1>

                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <form
                    action="https://api.web3forms.com/submit"
                    method="POST"
                    className="w-fit h-fit flex flex-col gap-2 pb-10"
                >
                    <input
                        type="hidden"
                        name="access_key"
                        value="d2880029-4d58-4d02-9ad8-8a72588a6799"
                    />

                    <input
                        type="text"
                        name="name"
                        placeholder="name"
                        required
                        className="text-white bg-white/8 border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 p-2 rounded-lg outline-none"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="email"
                        required
                        className="text-white bg-white/8 border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 p-2 rounded-lg outline-none"
                    />

                    <textarea
                        name="message"
                        placeholder="message"
                        required
                        className="text-white bg-white/8 border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 p-2 rounded-lg outline-none"
                    />

                    <motion.button
                        initial={{ opacity: 1 }}
                        whileHover={{ opacity: 0.6 }}
                        type="submit"
                        className="text-white bg-[#2257B9] border-t border-l-[0.5px] border-r-[0.5px] border-b-0 border-white/10 p-2 rounded-lg outline-none cursor-pointer"
                    >
                        Contact Us
                    </motion.button>
                    <p className="text-white/30">by pressing the 'contact us' button you agree that you took time to read our legal policies.</p>
                </form>
            </section>

            {/*footer*/}
            <section className="w-full h-fit flex flex-col z-10 pt-25 gap-5 bg-black border-t border-white/10">
                <h1 className="zalando uppercase text-white text-6xl">Blanket</h1>
            </section>
        </div>
    )
}