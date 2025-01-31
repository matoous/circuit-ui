/**
 * Copyright 2020, SumUp Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { FC, OlHTMLAttributes } from 'react';

import Button from '../../../Button/index.js';

import classes from './PageList.module.css';

export interface PageListProps
  extends Omit<OlHTMLAttributes<HTMLOListElement>, 'onChange'> {
  onChange: (page: number) => void;
  pageLabel: (page: number) => string;
  pages: number[];
  currentPage: number;
}

export const PageList: FC<PageListProps> = ({
  onChange,
  pageLabel,
  pages,
  currentPage,
  ...props
}: PageListProps): JSX.Element => (
  // eslint-disable-next-line jsx-a11y/no-redundant-roles
  <ol role="list" className={classes.base} {...props}>
    {pages.map((page) => {
      const isCurrent = currentPage === page;
      const label = pageLabel(page);
      return (
        <li key={page}>
          <Button
            size="kilo"
            onClick={() => onChange(page)}
            variant={isCurrent ? 'primary' : 'tertiary'}
            title={label}
            aria-label={label}
            aria-current={isCurrent}
            className={classes.button}
          >
            {page}
          </Button>
        </li>
      );
    })}
  </ol>
);
