/**
 * Copyright 2021, SumUp Ltd.
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

import { describe, expect, it, vi } from 'vitest';
import { FC } from 'react';
import { IconProps, Plus } from '@sumup/icons';

import { ClickEvent } from '../../../../types/events.js';
import {
  render,
  axe,
  RenderFn,
  userEvent,
} from '../../../../util/test-utils.js';

import { PrimaryLink, PrimaryLinkProps } from './PrimaryLink.js';

describe('PrimaryLink', () => {
  function renderPrimaryLink<T>(
    renderFn: RenderFn<T>,
    props: PrimaryLinkProps,
  ) {
    return renderFn(<PrimaryLink {...props} />);
  }

  const baseProps = {
    icon: Plus as FC<IconProps>,
    label: 'Label',
    href: '/url',
    onClick: vi.fn(),
  };

  it('should render as active', () => {
    const { getByRole } = renderPrimaryLink(render, {
      ...baseProps,
      isActive: true,
    });
    expect(getByRole('link')).toHaveAttribute('aria-current', 'page');
  });

  it.todo('should render with an external icon');

  it('should render with a suffix icon', () => {
    const { getByTestId } = renderPrimaryLink(render, {
      ...baseProps,
      // eslint-disable-next-line react/display-name
      suffix: (props) => <div {...props} data-testid="suffix" />,
    });
    expect(getByTestId('suffix')).toBeVisible();
  });

  it('should call the onClick handler when clicked', async () => {
    const props = {
      ...baseProps,
      onClick: vi.fn((event: ClickEvent) => {
        event.preventDefault();
      }),
    };
    const { getByRole } = renderPrimaryLink(render, props);

    await userEvent.click(getByRole('link'));

    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it('should have no accessibility violations', async () => {
    const { container } = renderPrimaryLink(render, baseProps);
    const actual = await axe(container);
    expect(actual).toHaveNoViolations();
  });
});
