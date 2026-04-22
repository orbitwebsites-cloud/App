import useOnyx from '@hooks/useOnyx';
import {isCard, isCardPendingActivate, isCardPendingIssue, isCardWithCustomZeroLimit, isCardWithPotentialFraud, isExpensifyCard} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

function useTimeSensitiveCards() {
    const [cards] = useOnyx(ONYXKEYS.CARD_LIST);

    let cardNeedingShippingAddress: Card | undefined;
    const cardsNeedingActivation: Card[] = [];
    const cardsWithFraud: Card[] = [];

    for (const card of Object.values(cards ?? {})) {
        if (!isCard(card)) {
            continue;
        }

        if (!isExpensifyCard(card)) {
            continue;
        }

        if (isCardWithPotentialFraud(card) && card.nameValuePairs?.possibleFraud?.fraudAlertReportID) {
            cardsWithFraud.push(card);
        }

        if (isCardWithCustomZeroLimit(card)) {
            continue;
        }

        const isPhysicalCard = !card.nameValuePairs?.isVirtual;
        if (!isPhysicalCard) {
            continue;
        }

        if (!cardNeedingShippingAddress && isCardPendingIssue(card)) {
            cardNeedingShippingAddress = card;
        }

        if (isCardPendingActivate(card)) {
            cardsNeedingActivation.push(card);
        }
    }

    const shouldShowAddShippingAddress = !!cardNeedingShippingAddress;
    const shouldShowActivateCard = cardsNeedingActivation.length > 0;
    const shouldShowReviewCardFraud = cardsWithFraud.length > 0;

    return {
        shouldShowAddShippingAddress,
        shouldShowActivateCard,
        shouldShowReviewCardFraud,
        cardNeedingShippingAddress,
        cardsNeedingActivation,
        cardsWithFraud,
    };
}

export default useTimeSensitiveCards;
