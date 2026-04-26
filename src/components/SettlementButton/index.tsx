import React from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import SettlementButton from './SettlementButton';
import * as IOU from '@libs/actions/IOU';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOUUtils from '@libs/IOUUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as PaymentMethodsUtils from '@libs/PaymentMethodsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PaymentMethodType} from '@src/types/onyx';
import type {Report} from '@src/types/onyx/Report';
import type {Transaction} from '@src/types/onyx/Transaction';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

type SettlementButtonProps = {
    /** The report to pay */
    report: OnyxEntry<Report>;

    /** The currency used in the report */
    currency: string;

    /** The ID of the current report */
    reportID: string;

    /** The chat report ID that holds the actions for the report */
    chatReportID: string;

    /** Personal details of all the users */
    personalDetails: OnyxEntry<Record<string, {firstName?: string; lastName?: string; displayName?: string; avatar?: string}>>;

    /** The policy of the report */
    policy: OnyxEntry<ReportUtils.Policy>;

    /** The type of IOU report */
    iouType: ValueOf<typeof CONST.IOU.TYPE>;

    /** The transactions associated with the report */
    transactions: OnyxEntry<Transaction[]>;

    /** Whether the IOU is loading */
    isLoading: boolean;

    /** Whether the IOU should be disabled */
    isDisabled: boolean;

    /** Whether the IOU should be displayed in compact mode */
    isCompact?: boolean;

    /** Whether the IOU should be displayed in a modal */
    isModal?: boolean;

    /** Whether the IOU should be displayed in a popover */
    isPopover?: boolean;

    /** Whether the IOU should be displayed in a tooltip */
    isTooltip?: boolean;

    /** Whether the IOU should be displayed in a menu */
    isMenu?: boolean;

    /** Whether the IOU should be displayed in a list */
    isList?: boolean;

    /** Whether the IOU should be displayed in a card */
    isCard?: boolean;

    /** Whether the IOU should be displayed in a button */
    isButton?: boolean;

    /** Whether the IOU should be displayed in a link */
    isLink?: boolean;

    /** Whether the IOU should be displayed in a text */
    isText?: boolean;

    /** Whether the IOU should be displayed in a chip */
    isChip?: boolean;

    /** Whether the IOU should be displayed in a badge */
    isBadge?: boolean;

    /** Whether the IOU should be displayed in a tag */
    isTag?: boolean;

    /** Whether the IOU should be displayed in a pill */
    isPill?: boolean;

    /** Whether the IOU should be displayed in a dot */
    isDot?: boolean;

    /** Whether the IOU should be displayed in a circle */
    isCircle?: boolean;

    /** Whether the IOU should be displayed in a square */
    isSquare?: boolean;

    /** Whether the IOU should be displayed in a rectangle */
    isRectangle?: boolean;

    /** Whether the IOU should be displayed in a triangle */
    isTriangle?: boolean;

    /** Whether the IOU should be displayed in a pentagon */
    isPentagon?: boolean;

    /** Whether the IOU should be displayed in a hexagon */
    isHexagon?: boolean;

    /** Whether the IOU should be displayed in a heptagon */
    isHeptagon?: boolean;

    /** Whether the IOU should be displayed in an octagon */
    isOctagon?: boolean;

    /** Whether the IOU should be displayed in a nonagon */
    isNonagon?: boolean;

    /** Whether the IOU should be displayed in a decagon */
    isDecagon?: boolean;

    /** Whether the IOU should be displayed in a star */
    isStar?: boolean;

    /** Whether the IOU should be displayed in a heart */
    isHeart?: boolean;

    /** Whether the IOU should be displayed in a diamond */
    isDiamond?: boolean;

    /** Whether the IOU should be displayed in a spade */
    isSpade?: boolean;

    /** Whether the IOU should be displayed in a club */
    isClub?: boolean;

    /** Whether the IOU should be displayed in a flag */
    isFlag?: boolean;

    /** Whether the IOU should be displayed in a pin */
    isPin?: boolean;

    /** Whether the IOU should be displayed in a location */
    isLocation?: boolean;

    /** Whether the IOU should be displayed in a map */
    isMap?: boolean;

    /** Whether the IOU should be displayed in a globe */
    isGlobe?: boolean;

    /** Whether the IOU should be displayed in a planet */
    isPlanet?: boolean;

    /** Whether the IOU should be displayed in a moon */
    isMoon?: boolean;

    /** Whether the IOU should be displayed in a sun */
    isSun?: boolean;

    /** Whether the IOU should be displayed in a star */
    isStar2?: boolean;

    /** Whether the IOU should be displayed in a comet */
    isComet?: boolean;

    /** Whether the IOU should be displayed in a meteor */
    isMeteor?: boolean;

    /** Whether the IOU should be displayed in a galaxy */
    isGalaxy?: boolean;

    /** Whether the IOU should be displayed in a universe */
    isUniverse?: boolean;

    /** Whether the IOU should be displayed in a multiverse */
    isMultiverse?: boolean;

    /** Whether the IOU should be displayed in a dimension */
    isDimension?: boolean;

    /** Whether the IOU should be displayed in a portal */
    isPortal?: boolean;

    /** Whether the IOU should be displayed in a wormhole */
    isWormhole?: boolean;

    /** Whether the IOU should be displayed in a blackhole */
    isBlackhole?: boolean;

    /** Whether the IOU should be displayed in a whitehole */
    isWhitehole?: boolean;

    /** Whether the IOU should be displayed in a singularity */
    isSingularity?: boolean;

    /** Whether the IOU should be displayed in a quantum */
    isQuantum?: boolean;

    /** Whether the IOU should be displayed in a particle */
    isParticle?: boolean;

    /** Whether the IOU should be displayed in a wave */
    isWave?: boolean;

    /** Whether the IOU should be displayed in a field */
    isField?: boolean;

    /** Whether the IOU should be displayed in a force */
    isForce?: boolean;

    /** Whether the IOU should be displayed in a energy */
    isEnergy?: boolean;

    /** Whether the IOU should be displayed in a power */
    isPower?: boolean;

    /** Whether the IOU should be displayed in a work */
    isWork?: boolean;

    /** Whether the IOU should be displayed in a heat */
    isHeat?: boolean;

    /** Whether the IOU should be displayed in a light */
    isLight?: boolean;

    /** Whether the IOU should be displayed in a sound */
    isSound?: boolean;

    /** Whether the IOU should be displayed in a vibration */
    isVibration?: boolean;

    /** Whether the IOU should be displayed in a frequency */
    isFrequency?: boolean;

    /** Whether the IOU should be displayed in a wavelength */
    isWavelength?: boolean;

    /** Whether the IOU should be displayed in a amplitude */
    isAmplitude?: boolean;

    /** Whether the IOU should be displayed in a phase */
    isPhase?: boolean;

    /** Whether the IOU should be displayed in a interference */
    isInterference?: boolean;

    /** Whether the IOU should be displayed in a diffraction */
    isDiffraction?: boolean;

    /** Whether the IOU should be displayed in a refraction */
    isRefraction?: boolean;

    /** Whether the IOU should be displayed in a reflection */
    isReflection?: boolean;

    /** Whether the IOU should be displayed in a absorption */
    isAbsorption?: boolean;

    /** Whether the IOU should be displayed in a transmission */
    isTransmission?: boolean;

    /** Whether the IOU should be displayed in a scattering */
    isScattering?: boolean;

    /** Whether the IOU should be displayed in a polarization */
    isPolarization?: boolean;

    /** Whether the IOU should be displayed in a dispersion */
    isDispersion?: boolean;

    /** Whether the IOU should be displayed in a resonance */
    isResonance?: boolean;

    /** Whether the IOU should be displayed in a damping */
    isDamping?: boolean;

    /** Whether the IOU should be displayed in a oscillation */
    isOscillation?: boolean;

    /** Whether the IOU should be displayed in a vibration */
    isVibration2?: boolean;

    /** Whether the IOU should be displayed in a wave */
    isWave2?: boolean;

    /** Whether the IOU should be displayed in a field */
    isField2?: boolean;

    /** Whether the IOU should be displayed in a force */
    isForce2?: boolean;

    /** Whether the IOU should be displayed in a energy */
    isEnergy2?: boolean;

    /** Whether the IOU should be displayed in a power */
    isPower2?: boolean;

    /** Whether the IOU should be displayed in a work */
    isWork2?: boolean;

    /** Whether the IOU should be displayed in a heat */
    isHeat2?: boolean;

    /** Whether the IOU should be displayed in a light */
    isLight2?: boolean;

    /** Whether the IOU should be displayed in a sound */
    isSound2?: boolean;

    /** Whether the IOU should be displayed in a vibration */
    isVibration3?: boolean;

    /** Whether the IOU should be displayed in a frequency */
    isFrequency2?: boolean;

    /** Whether the IOU should be displayed in a wavelength */
    isWavelength2?: boolean;

    /** Whether the IOU should be displayed in a amplitude */
    isAmplitude2?: boolean;

    /** Whether the IOU should be displayed in a phase */
    isPhase2?: boolean;

    /** Whether the IOU should be displayed in a interference */
    isInterference2?: boolean;

    /** Whether the IOU should be displayed in a diffraction */
    isDiffraction2?: boolean;

    /** Whether the IOU should be displayed in a refraction */
    isRefraction2?: boolean;

    /** Whether the IOU should be displayed in a reflection */
    isReflection2?: boolean;

    /** Whether the IOU should be displayed in a absorption */
    isAbsorption2?: boolean;

    /** Whether the IOU should be displayed in a transmission */
    isTransmission2?: boolean;

    /** Whether the IOU should be displayed in a scattering */
    isScattering2?: boolean;

    /** Whether the IOU should be displayed in a polarization */
    isPolarization2?: boolean;

    /** Whether the IOU should be displayed in a dispersion */
    isDispersion2?: boolean;

    /** Whether the IOU should be displayed in a resonance */
    isResonance2?: boolean;

    /** Whether the IOU should be displayed in a damping */
    isDamping2?: boolean;

    /** Whether the IOU should be displayed in a oscillation */
    isOscillation2?: boolean;

    /** Whether the IOU should be displayed in a vibration */
    isVibration4?: boolean;

    /** Whether the IOU should be displayed in a wave */
    isWave3?: boolean;

    /** Whether the IOU should be displayed in a field */
    isField3?: boolean;

    /** Whether the IOU should be displayed in a force */
    isForce3?: boolean;

    /** Whether the IOU should be displayed in a energy */
    isEnergy3?: boolean;

    /** Whether the IOU should be displayed in a power */
    isPower3?: boolean;

    /** Whether the IOU should be displayed in a work */
    isWork3?: boolean;

    /** Whether the IOU should be displayed in a heat */
    isHeat3?: boolean;

    /** Whether the IOU should be displayed in a light */
    isLight3?: boolean;

    /** Whether the IOU should be displayed in a sound */
    isSound3?: boolean;

    /** Whether the IOU should be displayed in a vibration */
    isVibration5?: boolean;

    /** Whether the IOU should be displayed in a frequency */
    isFrequency3?: boolean;

    /** Whether the IOU should be displayed in a wavelength */
    isWavelength3?: boolean;

    /** Whether the IOU should be displayed in a amplitude */
    isAmplitude3?: boolean;

    /** Whether the IOU should be displayed in a phase */
    isPhase3?: boolean;

    /** Whether the IOU should be displayed in a interference */
    isInterference3?: boolean;

    /** Whether the IOU should be displayed in a diffraction */
    isDiffraction3?: boolean;

    /** Whether the IOU should be displayed in a refraction */
    isRefraction3?: boolean;

    /** Whether the IOU should be displayed in a reflection */
    isReflection3?: boolean;

    /** Whether the IOU should be displayed in a absorption */
    isAbsorption3?: boolean;

    /** Whether the IOU should be displayed in a transmission */
    isTransmission3?: boolean;

    /** Whether the IOU should be displayed in a scattering */
    isScattering3?: boolean;

    /** Whether the IOU should be displayed in a polarization */
    isPolarization3?: boolean;

    /** Whether the IOU should be displayed in a dispersion */
    isDispersion3?: boolean;

    /** Whether the IOU should be displayed in a resonance */
    isResonance3?: boolean;

    /** Whether the IOU should be displayed in a damping */
    isDamping3?: boolean;

    /** Whether the IOU should be displayed in a oscillation */
    isOscillation3?: boolean;

    /** Whether the IOU should be displayed in a vibration */
    isVibration6?: boolean;

    /** Whether the IOU should be displayed in a wave */
    isWave4?: boolean;

    /** Whether the IOU should be displayed in a field */
    isField4?: boolean;

    /** Whether the IOU should be displayed in a force */
    isForce4?: boolean;

    /** Whether the IOU should be displayed in a energy */
    isEnergy4?: boolean;

    /** Whether the IOU should be displayed in a power */
    isPower4?: boolean;

    /** Whether the IOU should be displayed in a work */
    isWork4?: boolean;

    /** Whether the IOU should be displayed in a heat */
    isHeat4?: boolean;

    /** Whether the IOU should be displayed in a light */
    isLight4?: boolean;

    /** Whether the IOU should be displayed in a sound */
    isSound4?: boolean;

    /** Whether the IOU should be displayed in a vibration */
    isVibration7?: boolean;

    /** Whether the IOU should be displayed in a frequency */
    isFrequency4?: boolean;

    /** Whether the IOU should be displayed in a wavelength */
    isWavelength4?: boolean;

    /** Whether the IOU should be displayed in a amplitude */
    isAmplitude4?: boolean;

    /** Whether the IOU should be displayed in a phase */
    isPhase4?: boolean;

    /** Whether the IOU should be displayed in a interference */
    isInterference4?: boolean;

    /** Whether the IOU should be displayed in a diffraction */
    isDiffraction4?: boolean;

    /** Whether the IOU should be displayed in a refraction */
    isRefraction4?: boolean;

    /** Whether the IOU should be displayed in a reflection */
    isReflection4?: boolean;

    /** Whether the IOU should be displayed in a absorption */
    isAbsorption4?: boolean;

    /** Whether the IOU should be displayed in a transmission */
    isTransmission4?: boolean;

    /** Whether the IOU should be displayed in a scattering */
    isScattering4?: boolean;

    /** Whether the IOU should be displayed in a polarization */
    isPolarization4?: boolean;

    /** Whether the IOU should be displayed in a dispersion */
    isDispersion4?: boolean;

    /** Whether the IOU should be displayed in a resonance */
    isResonance4?: boolean;

    /** Whether the IOU should be displayed in a damping */
    isDamping4?: boolean;

    /** Whether the IOU should be displayed in a oscillation */
    isOscillation4?: boolean;

    /** Whether the IOU should be displayed in a vibration */
    isVibration8?: boolean;

    /** Whether the IOU should be displayed in a wave */
    isWave5?: boolean;

    /** Whether the IOU should be displayed in a field */
    isField5?: boolean;

    /** Whether the IOU should be displayed in a force */
    isForce5?: boolean;

    /** Whether the IOU should be displayed in a energy */
    isEnergy5?: boolean;

    /** Whether the IOU should be displayed in a power */
    isPower5?: boolean;

    /** Whether the IOU should be displayed in a work */
    isWork5?: boolean;

    /** Whether the IOU should be displayed in a heat */
    isHeat5?: boolean;

    /** Whether the IOU should be displayed in a light */
    isLight5?: boolean;

    /** Whether the IOU should be displayed in a sound */
    isSound5?: boolean;

    /** Whether the IOU should be displayed in a vibration */
    isVibration9?: boolean;

    /** Whether the IOU should be displayed in a frequency */
    isFrequency5?: boolean;

    /** Whether the IOU should be displayed in a wavelength */
    isWavelength5?: boolean;

    /** Whether the IOU should be displayed in a amplitude */
    isAmplitude5?: boolean;

    /** Whether the IOU should be displayed in a phase */
    isPhase5?: boolean;

    /** Whether the IOU should be displayed in a interference */
    isInterference5?: boolean;

    /** Whether the IOU should be displayed in a diffraction */
    isDiffraction5?: boolean;

    /** Whether the IOU should be displayed in a refraction */
    isRefraction5?: boolean;

    /** Whether the IOU should be displayed in a reflection */
    isReflection5?: boolean;

    /** Whether the IOU should be displayed in a absorption */
    isAbsorption5?: boolean;

    /** Whether