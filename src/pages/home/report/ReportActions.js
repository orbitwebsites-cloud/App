import type {RefObject} from 'react';
import type {ScrollView} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {Route} from '@react-navigation/native';
import type {Report} from '@src/types/onyx';
import type {ReportAction} from '@src/types/onyx/ReportAction';
import type {NavigationState} from '@react-navigation/native';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import * as Session from '@userActions/Session';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActions from '@userActions/ReportActions';
import * as IOU from '@userActions/IOU';
import * as Modal from '@userActions/Modal';
import * as PushNotification from '@userActions/PushNotification';
import * as Localize from '@libs/Localize';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as EmojiPickerActions from '@userActions/EmojiPicker';
import * as ReportUtils from '@libs/ReportUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import * as Session from '@userActions/Session';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActions from '@userActions/ReportActions';
import * as IOU from '@userActions/IOU';
import * as Modal from '@userActions/Modal';
import * as PushNotification from '@userActions/PushNotification';
import * as Localize from '@libs/Localize';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as EmojiPickerActions from '@userActions/EmojiPicker';

// Handle leaving a report
const leaveReport = (reportID: string) => {
    // Leave the report
    Report.leaveRoom(reportID);

    // Use the navigation service to leave the report safely
    Navigation.leaveReport(reportID);
};

export {leaveReport};