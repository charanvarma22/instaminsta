import React, { useEffect } from 'react';

interface SEOProps {
    title: string;
    description?: string;
    canonical?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, canonical }) => {
    useEffect(() => {
        // Update title
        document.title = `${title} | instaminsta`;

        // Update description meta tag
        if (description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', description);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'description';
                meta.content = description;
                document.head.appendChild(meta);
            }
        }

        // Update canonical link
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        const href = canonical ? `https://instaminsta.com${canonical}` : 'https://instaminsta.com/';

        if (linkCanonical) {
            linkCanonical.setAttribute('href', href);
        } else {
            const link = document.createElement('link');
            link.rel = 'canonical';
            link.href = href;
            document.head.appendChild(link);
        }
    }, [title, description, canonical]);

    return null;
};

export default SEO;
