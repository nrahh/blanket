import ReactMarkdown from "react-markdown";

const LEGAL_TEXT = `
# Blanket.ink: Terms of Use & Privacy Policy

*Last updated: 12/10/26 (USING DD/MM/YYYY Format)*

## Part 1: Terms of Use

### 1. About Blanket.ink
Blanket.ink ("the Site", "we", "us") is a design platform run by Blanket, where visitors can request custom designs from us and view work created by our team. You can reach us at blanket.ink@proton.me.

### 2. Using the Site
No account is needed to use the Site. By using it or sending us a request, you agree to these Terms. If you do not agree, please do not use the Site. You must be old enough to enter a binding agreement where you live, or have a parent or guardian's permission.

### 3. Design Requests
- You can request a design by contacting us through the Site's contact form.
- Sending a request does not guarantee we will accept it. We may decline any request, for example if it is unlawful, hateful, or infringes someone else's rights.
- Design requests are currently **free**. We may introduce paid services in the future, and will update these Terms before doing so.
- Timelines, number of revisions and the scope of each project will be agreed with you directly.

### 4. Ownership of Finished Work
- Once we deliver the final artwork for your request, **you own it fully**. We transfer all rights in the final delivered design to you.
- We keep ownership of our pre-existing tools, templates, fonts, stock elements and general know-how. Where a third-party asset (such as a font or stock image) is used, its own license may apply and we will tell you about it.
- Unused drafts, sketches and concepts that are not part of the final delivered design remain ours unless we agree otherwise.

### 5. Showing Your Work in Our Portfolio
We will display a finished client design on the Site or in our promotion **only with your permission**. You can give or withdraw that permission by contacting us. If you withdraw it, we will remove the design from the Site within a reasonable time, though we cannot control copies already shared elsewhere.

### 6. Content You Give Us
If you send reference images, text, logos or other material, you confirm that you have the right to use them and that they do not infringe anyone else's rights or break the law. You give us permission to use that material only to carry out your request. You are responsible for any claim that arises from material you supplied.

### 7. Our Work on the Site
The designs shown in our portfolio are uploaded by our team only. Unless a design is marked as belonging to a client, it is our property. You may not copy, reuse or redistribute our portfolio work without written permission.

### 8. Acceptable Use
You agree not to misuse the Site, including by attempting to disrupt it, gain unauthorized access, send spam through the contact form, or use it for unlawful purposes.

### 9. No Guarantees
The Site and our services are provided "as is". We work hard on every design, but we do not promise that the Site will always be available or error-free, or that a design will be suitable for a particular purpose, for example that a logo can be trademarked. It is your responsibility to check that a finished design is suitable and legal for your intended use.

### 10. Limitation of Liability
To the extent permitted by law, we are not liable for indirect or consequential losses arising from the use of the Site or our designs. Because our current services are free, our total liability to you is limited to the maximum extent allowed by law. Nothing in these Terms excludes liability that cannot legally be excluded.

### 11. Changes
We may update these Terms from time to time. The date at the top shows when they last changed. Continuing to use the Site after a change means you accept the updated Terms.

## Part 2: Privacy Policy

### 1. Who We Are
Blanket.ink is run by Blanket. Contact: blanket.ink@proton.me.

### 2. What We Collect
The Site does not require an account. We only collect information you choose to send us through the contact form, which is powered by **Web3Forms**. This typically includes:
- your name and email address,
- the message and details of your design request,
- any other information you include in your message.

### 3. How We Use It
We use your information only to reply to you, to discuss and deliver your design request, and to keep a record of our communication. We do not sell your information.

### 4. Third-Party Service
Contact form messages are processed by Web3Forms, which delivers them to us. Their handling of data is covered by their own privacy policy: https://web3forms.com/privacy.

### 5. How Long We Keep It
We keep the emails you send us, and any files attached to them, for as long as we need them to respond to your request, keep a record of past design requests, and resolve any disputes. We do not set an automatic deletion date. You can ask us to delete your emails at any time by writing to blanket.ink@proton.me, and we will do so within 30 days unless the law requires us to keep them.
### 6. Your Rights
You can ask us at any time to see, correct or delete the information we hold about you. Email us at blanket.ink@proton.me and we will respond within a reasonable time.

### 7. Children
The Site is not directed at children under 16, and we do not knowingly collect their information.

### 8. Security
We take reasonable steps to protect your information, but no online service is completely secure.

### 9. Changes
We may update this policy and will change the date at the top when we do.
M
### 10. Contact
Questions about this policy: blanket.ink@proton.me.
`;

// Styling for each markdown element, so no typography plugin is needed.
const components = {
    h1: (props) => (
        <h1 className="text-3xl font-semibold tracking-tight mb-2" {...props} />
    ),
    h2: (props) => (
        <h2
            className="text-2xl font-semibold mt-12 mb-3 pb-2 border-b border-current/20"
            {...props}
        />
    ),
    h3: (props) => <h3 className="text-lg font-semibold mt-8 mb-2" {...props} />,
    p: (props) => <p className="leading-relaxed my-3" {...props} />,
    ul: (props) => <ul className="list-disc pl-6 my-3 space-y-1.5" {...props} />,
    ol: (props) => <ol className="list-decimal pl-6 my-3 space-y-1.5" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
    strong: (props) => <strong className="font-semibold" {...props} />,
    em: (props) => <em className="italic opacity-70" {...props} />,
    a: (props) => <a className="underline underline-offset-2" {...props} />,
};

export default function Legal() {
    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
                <article className="max-w-3xl mx-auto px-6 py-12 text-white">
                    <ReactMarkdown components={components}>{LEGAL_TEXT}</ReactMarkdown>
                </article>
            </div>
        </div>
    );
}