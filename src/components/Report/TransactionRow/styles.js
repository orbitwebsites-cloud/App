import {StyleSheet} from 'react-native';
import themeColors from '../../styles/themes/default';

const styles = StyleSheet.create({
    transactionRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
        cursor: 'pointer',
    },
    chevronCell: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        flexShrink: 0,
    },
    contentCell: {
        flex: 1,
        minWidth: 0,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    title: {
        fontWeight: '600',
        fontSize: 15,
        color: themeColors.text,
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: themeColors.textSupporting,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    amountCell: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        minWidth: 80,
        fontWeight: '600',
        fontSize: 15,
        color: themeColors.text,
    },
});

export default styles;