/**
 * Copyright 2022, SumUp Ltd.
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

import {
  createContext,
  useCallback,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import ReactModal, { Props as ReactModalProps } from 'react-modal';

import { useMedia } from '../../hooks/useMedia/index.js';
import { useStack, StackItem } from '../../hooks/useStack/index.js';
import { Require } from '../../types/util.js';
import { warn } from '../../util/logger.js';
import { clsx } from '../../styles/clsx.js';
import { useLatest } from '../../hooks/useLatest/useLatest.js';

import { SidePanel, SidePanelProps } from './SidePanel.js';
import { TRANSITION_DURATION } from './constants.js';
import type { SidePanelHookProps } from './useSidePanel.js';
import classes from './SidePanelContext.module.css';
import './SidePanelContext.css';

// It is important for users of screen readers that other page content be hidden
// (via the `aria-hidden` attribute) while the side panel is open on mobile.
// To allow react-modal to do this, Circuit UI calls `ReactModal.setAppElement`
// with a query selector identifying the root of the app.
// http://reactcommunity.org/react-modal/accessibility/#app-element
if (typeof window !== 'undefined') {
  // These are the default app elements in Next.js, Docusaurus, CRA and Storybook.
  const appElement =
    document.getElementById('__next') ||
    document.getElementById('__docusaurus') ||
    document.getElementById('root') ||
    document.getElementById('storybook-root');

  if (appElement) {
    ReactModal.setAppElement(appElement);
  } else if (
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'test'
  ) {
    warn(
      'SidePanelProvider',
      'Could not find the app root element to hide it when a side panel is open.',
      'Add an element with the id `#root` at the root of your application.',
    );
  }
}

export type SidePanelContextProps = Require<SidePanelHookProps, 'group'>;

export type SetSidePanel = (
  sidePanel: SidePanelContextProps & Pick<StackItem, 'id'>,
) => void;

export type UpdateSidePanel = (
  sidePanel: Partial<SidePanelContextProps> &
    Pick<Required<SidePanelContextProps>, 'group'>,
) => void;

export type RemoveSidePanel = (
  group: SidePanelContextProps['group'],
  isInstantClose?: boolean,
) => Promise<void | void[]>;

type SidePanelContextItem = SidePanelContextProps &
  Pick<SidePanelProps, 'isInstantOpen'> &
  Pick<
    ReactModalProps,
    'closeTimeoutMS' | 'onAfterClose' | 'shouldReturnFocusAfterClose'
  > &
  StackItem;

export type SidePanelContextValue = {
  setSidePanel: SetSidePanel;
  updateSidePanel: UpdateSidePanel;
  removeSidePanel: RemoveSidePanel;
  isPrimaryContentResized: boolean;
  transitionDuration: number;
};

export const SidePanelContext = createContext<SidePanelContextValue>({
  setSidePanel: () => {},
  updateSidePanel: () => {},
  removeSidePanel: () => Promise.resolve(),
  isPrimaryContentResized: false,
  transitionDuration: TRANSITION_DURATION,
});

export interface SidePanelProviderProps {
  /**
   * The SidePanelProvider should wrap your entire primary content,
   * which will be resized when the side panel is opened.
   */
  children: ReactNode;
}

export function SidePanelProvider({ children }: SidePanelProviderProps) {
  const isMobile = useMedia('(max-width: 767px)');
  const [sidePanels, dispatch] = useStack<SidePanelContextItem>();
  const [isPrimaryContentResized, setIsPrimaryContentResized] = useState(false);

  const sidePanelsRef = useLatest(sidePanels);

  const findSidePanel = useCallback(
    (group: SidePanelContextProps['group']) =>
      sidePanelsRef.current.find(
        (panel) => panel.group === group && !panel.transition,
      ),
    [sidePanelsRef],
  );

  const removeSidePanel = useCallback<RemoveSidePanel>(
    (group, isInstantClose) => {
      const panel = findSidePanel(group);

      if (!panel) {
        return Promise.resolve();
      }

      const sidePanelIndex = sidePanelsRef.current.indexOf(panel);

      if (!isInstantClose) {
        setIsPrimaryContentResized(sidePanelIndex !== 0);
      }

      // Remove the side panel and all panels above it in reverse order
      return Promise.all(
        sidePanelsRef.current
          .slice(sidePanelIndex)
          .reverse()
          .map(
            (sidePanel) =>
              new Promise<void>((res) => {
                if (sidePanel.onClose) {
                  sidePanel.onClose();
                }

                let updatedPanel = { ...sidePanel, onAfterClose: res };
                if (isInstantClose) {
                  updatedPanel = {
                    ...updatedPanel,
                    shouldReturnFocusAfterClose: false,
                    closeTimeoutMS: 0,
                  };
                }

                dispatch({
                  type: 'update',
                  item: updatedPanel,
                });
                dispatch({
                  type: 'remove',
                  id: sidePanel.id,
                  transition: {
                    duration: isInstantClose ? 0 : TRANSITION_DURATION,
                  },
                });
              }),
          ),
      );
    },
    [findSidePanel, dispatch, sidePanelsRef],
  );

  const setSidePanel = useCallback<SetSidePanel>(
    (sidePanel) => {
      const panel = findSidePanel(sidePanel.group);

      const pushPanel = (isInstantOpen: boolean) => {
        setIsPrimaryContentResized(true);
        dispatch({
          type: 'push',
          item: { ...sidePanel, isInstantOpen },
        });
      };

      if (panel) {
        removeSidePanel(panel.group, true)
          .then(() => pushPanel(true))
          .catch(() => {});
      } else {
        pushPanel(false);
      }
    },
    [findSidePanel, dispatch, removeSidePanel],
  );

  const updateSidePanel = useCallback<UpdateSidePanel>(
    (sidePanel) => {
      const panel = findSidePanel(sidePanel.group);

      if (panel) {
        dispatch({
          type: 'update',
          item: { ...sidePanel, id: panel.id },
        });
      }
    },
    [findSidePanel, dispatch],
  );

  const context = useMemo(
    () => ({
      setSidePanel,
      updateSidePanel,
      removeSidePanel,
      isPrimaryContentResized: !isMobile && isPrimaryContentResized,
      transitionDuration: TRANSITION_DURATION,
    }),
    [
      setSidePanel,
      updateSidePanel,
      removeSidePanel,
      isMobile,
      isPrimaryContentResized,
    ],
  );

  return (
    <SidePanelContext.Provider value={context}>
      <div
        className={clsx(
          classes.base,
          !isMobile && isPrimaryContentResized && classes.resized,
        )}
      >
        {children}
      </div>

      {sidePanels.map((sidePanel) => {
        const { group, id, transition, ...sidePanelProps } = sidePanel;

        const isBottomPanelClosing = !!sidePanels[0].transition;
        const isStacked = group !== sidePanels[0].group;
        const handleClose = () => {
          void removeSidePanel(sidePanels[0].group);
        };
        const handleBack = isStacked ? () => removeSidePanel(group) : undefined;

        return (
          <SidePanel
            {...sidePanelProps}
            key={id}
            isBottomPanelClosing={isBottomPanelClosing}
            isMobile={isMobile}
            isOpen={!transition}
            isStacked={isStacked}
            onBack={handleBack}
            onClose={handleClose}
          />
        );
      })}
    </SidePanelContext.Provider>
  );
}
