import CONST from 'src/CONST';

// Add missing constant if not present
if (!CONST.POLICY) {
    CONST.POLICY = {};
}

if (!CONST.POLICY.PENDING_ACTION) {
    CONST.POLICY.PENDING_ACTION = {
        DELETE: 'delete',
    };
}

export default CONST;