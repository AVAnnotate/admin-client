import type { Translations } from '@ty/Types.ts';

export const rightsOptions = (i18n: Translations) => {
  const { t } = i18n;
  return [
    {
      label: t['In Copyright'],
      value: 'https://rightsstatements.org/vocab/InC/1.0/',
    },
    {
      label: t['In Copyright - EU Orphan Work'],
      value: 'https://rightsstatements.org/vocab/InC-OW-EU/1.0/',
    },
    {
      label: t['In Copyright - Educational Use Permitted'],
      value: 'https://rightsstatements.org/vocab/InC-EDU/1.0/',
    },
    {
      label: t['In Copyright - Non-Commercial Use Permitted'],
      value: 'https://rightsstatements.org/vocab/InC-NC/1.0/',
    },
    {
      label: t['In Copyright - Rights-holder(s) Unlocatable or Unidentifiable'],
      value: 'https://rightsstatements.org/vocab/InC-RUU/1.0/',
    },
    {
      label: t['No Copyright - Contractual Restrictions'],
      value: 'https://rightsstatements.org/vocab/NoC-CR/1.0/',
    },
    {
      label: t['No Copyright - Non-Commercial Use Only'],
      value: 'https://rightsstatements.org/vocab/NoC-NC/1.0/',
    },
    {
      label: t['No Copyright - Other Known Legal Restrictions'],
      value: 'https://rightsstatements.org/vocab/NoC-OKLR/1.0/',
    },
    {
      label: t['No Copyright - United States'],
      value: 'https://rightsstatements.org/vocab/NoC-US/1.0/',
    },
    {
      label: t['Copyright Not Evaluated'],
      value: 'https://rightsstatements.org/vocab/CNE/1.0/',
    },
    {
      label: t['Copyright Undetermined'],
      value: 'https://rightsstatements.org/vocab/UND/1.0/',
    },
    {
      label: t['No Known Copyright'],
      value: 'https://rightsstatements.org/vocab/NKC/1.0/',
    },
    {
      label: t['Creative Commons 4.0 International'],
      value: 'https://creativecommons.org/licenses/by/4.0/',
    },
    {
      label: t['Creative Commons 4.0 International - NonCommercial'],
      value: 'https://creativecommons.org/licenses/by-nc/4.0/',
    },
    {
      label:
        t['Creative Commons 4.0 International - NonCommercial - NoDerivatives'],
      value: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    },
    {
      label:
        t['Creative Commons 4.0 International - NonCommercial - ShareAlike'],
      value: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    },
    {
      label: t['Creative Commons 4.0 International - NoDerivatives'],
      value: 'https://creativecommons.org/licenses/by-nd/4.0/',
    },
    {
      label: t['Creative Commons 4.0 International - ShareAlike'],
      value: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
    {
      label: t['Creative Commons 3.0 Unported'],
      value: 'https://creativecommons.org/licenses/by/3.0/',
    },
    {
      label: t['Creative Commons 3.0 Unported - NonCommercial'],
      value: 'https://creativecommons.org/licenses/by-nc/3.0/',
    },
    {
      label: t['Creative Commons 3.0 Unported - NonCommercial - NoDerivatives'],
      value: 'https://creativecommons.org/licenses/by-nc-nd/3.0/',
    },
    {
      label: t['Creative Commons 3.0 Unported - NonCommercial - ShareAlike'],
      value: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    },
    {
      label: t['Creative Commons 3.0 Unported - NoDerivatives'],
      value: 'https://creativecommons.org/licenses/by-nd/3.0/',
    },
    {
      label: t['Creative Commons 3.0 Unported - ShareAlike'],
      value: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
    {
      label: t['Creative Commons 2.5 Generic'],
      value: 'https://creativecommons.org/licenses/by/2.5/',
    },
    {
      label: t['Creative Commons 2.5 Generic - NonCommercial'],
      value: 'https://creativecommons.org/licenses/by-nc/2.5/',
    },
    {
      label: t['Creative Commons 2.5 Generic - NonCommercial - NoDerivatives'],
      value: 'https://creativecommons.org/licenses/by-nc-nd/2.5/',
    },
    {
      label: t['Creative Commons 2.5 Generic - NonCommercial - ShareAlike'],
      value: 'https://creativecommons.org/licenses/by-nc-sa/2.5/',
    },
    {
      label: t['Creative Commons 2.5 Generic - NoDerivatives'],
      value: 'https://creativecommons.org/licenses/by-nd/2.5/',
    },
    {
      label: t['Creative Commons 2.5 Generic - ShareAlike'],
      value: 'https://creativecommons.org/licenses/by-sa/2.5/',
    },
  ];
};
