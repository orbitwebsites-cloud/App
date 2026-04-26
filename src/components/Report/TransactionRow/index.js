import React from 'react';
import PropTypes from 'prop-types';
import {TouchableOpacity, View} from 'react-native';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import styles from './styles';

const TransactionRow = ({transaction, onPress}) => (
    <TouchableOpacity style={styles.transactionRow} onPress={onPress}>
        <View style={styles.chevronCell}>
            <Icon src={Expensicons.ArrowRight} />
        </View>
        <View style={styles.contentCell}>
            <Text style={styles.title}>{transaction.description}</Text>
            <Text style={styles.description}>{transaction.merchant}</Text>
        </View>
        <View style={styles.amountCell}>
            <Text>{transaction.amount}</Text>
        </View>
    </TouchableOpacity>
);

TransactionRow.propTypes = {
    transaction: PropTypes.shape({
        description: PropTypes.string.isRequired,
        merchant: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
    }).isRequired,
    onPress: PropTypes.func.isRequired,
};

export default TransactionRow;