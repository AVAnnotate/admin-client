import { CaretRightIcon } from '@radix-ui/react-icons';

import './Breadcrumbs.css';
import React from 'react';

interface BreadcrumbsProps {
  items: {
    label: string;
    link: string;
  }[];
}

const truncate = (str: string) => {
  if (str.length <= 21) {
    return str;
  }

  return `${str.slice(0, 18)}...`;
};

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  return (
    <div className='breadcrumbs-container'>
      <ul className='breadcrumbs-list'>
        {props.items.map((item, idx) => (
          <React.Fragment key={idx}>
            <li
              className={idx === props.items.length - 1 ? 'current-item' : ''}
            >
              <a href={item.link}>{truncate(item.label)}</a>
            </li>
            {idx !== props.items.length - 1 ? (
              <CaretRightIcon color='white' height={22} width={22} />
            ) : (
              <></>
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};
