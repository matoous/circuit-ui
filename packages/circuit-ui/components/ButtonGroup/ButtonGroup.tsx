/**
 * Copyright 2019, SumUp Ltd.
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

import { forwardRef, HTMLAttributes } from 'react';

import Button, { ButtonProps } from '../Button/index.js';
import { clsx } from '../../styles/clsx.js';

import styles from './ButtonGroup.module.css';

type Action = Omit<ButtonProps, 'variant'>;

export interface ButtonGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'align'> {
  /**
   * The buttons to group. Expects a primary and optionally a secondary button.
   */
  actions: {
    primary: Action;
    secondary?: Action;
  };
  /**
   * Direction to align the buttons. Defaults to `center`.
   */
  align?: 'left' | 'center' | 'right';
}

/**
 * The ButtonGroup component groups and formats two buttons.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    { actions, className, align = 'center', ...props }: ButtonGroupProps,
    ref,
  ) => (
    <div
      {...props}
      className={clsx(styles.base, styles[align], className)}
      ref={ref}
    >
      <Button {...actions.primary} variant="primary" />
      {actions.secondary && (
        <Button
          {...actions.secondary}
          className={clsx(styles.secondary, actions.secondary.className)}
          variant="secondary"
        />
      )}
    </div>
  ),
);

ButtonGroup.displayName = 'ButtonGroup';
