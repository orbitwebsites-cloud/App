import {Portal} from '@gorhom/portal';
import React, {useEffect, useRef} from 'react';
import SparkleFallContainer from '@components/SparkleFall/SparkleFallContainer';
import type {SparkleFallHandle} from '@components/SparkleFall/SparkleFallContainer';
import {isReportActionUnread} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const GOAL_MESSAGE = "You've hit your goal for this week";

const firedActionIDs = new Set<string>();

type ChronosGoalCelebrationProps = {
    reportActions: OnyxTypes.ReportAction[];
    lastReadTime: string | undefined;
};

function ChronosGoalCelebration({reportActions, lastReadTime}: ChronosGoalCelebrationProps) {
    const ref = useRef<SparkleFallHandle>(null);

    useEffect(() => {
        for (const action of reportActions) {
            if (firedActionIDs.has(action.reportActionID)) {
                continue;
            }
            if (action.actorAccountID !== CONST.ACCOUNT_ID.CHRONOS) {
                continue;
            }
            const message = Array.isArray(action.message) ? action.message.at(0) : undefined;
            const text = message && 'text' in message ? (message.text ?? '') : '';
            if (!text.includes(GOAL_MESSAGE)) {
                continue;
            }
            if (!isReportActionUnread(action, lastReadTime)) {
                continue;
            }

            firedActionIDs.add(action.reportActionID);
            ref.current?.trigger();
            break;
        }
    }, [reportActions, lastReadTime]);

    return (
        <Portal hostName="SparkleFall">
            <SparkleFallContainer ref={ref} />
        </Portal>
    );
}

export default ChronosGoalCelebration;
