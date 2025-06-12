import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const detailKeys = [
  { key: 'gpt4o', link: 'compare.gpt4o.link', detail: 'compare.gpt4o.detail' },
  { key: 'midjourney', link: 'compare.midjourney.link', detail: 'compare.midjourney.detail' },
  { key: 'metaai', link: 'compare.metaai.link', detail: 'compare.metaai.detail' }
];

const CompareSection: React.FC = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="py-12" id="compare">
      <h2 className="text-2xl font-bold mb-6">{t('Flux AI vs Competitors: Why Choose Us')}</h2>
      <ul className="mb-8 space-y-2">
        {detailKeys.map(item => (
          <li key={item.key}>
            <a
              href={`#${item.key}-detail`}
              className="text-blue-600 underline hover:text-blue-800"
              onClick={e => {
                e.preventDefault();
                setActive(item.key);
                setTimeout(() => {
                  const el = document.getElementById(`${item.key}-detail`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 0);
              }}
            >
              {t(item.link)}
            </a>
          </li>
        ))}
      </ul>
      {detailKeys.map(item =>
        active === item.key ? (
          <div id={`${item.key}-detail`} className="mb-8" key={item.key}>
            <strong className="block mb-2">{t(item.link)}</strong>
            <p>{t(item.detail)}</p>
          </div>
        ) : null
      )}
    </section>
  );
};

export default CompareSection; 