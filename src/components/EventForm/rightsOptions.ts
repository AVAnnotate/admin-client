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
  ];
};
