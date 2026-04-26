import * as API from '../API';
import CONST from '../CONST';

/**
 * Imports tags to a policy
 *
 * @param {String} policyID
 * @param {Array<{name: String, enabled: Boolean}>} tags
 */
function importPolicyTags(policyID, tags) {
    const formattedTags = _.map(tags, (tag) => ({
        name: tag.name.trim(),
        enabled: Boolean(tag.enabled), // Ensure enabled is a boolean
    }));

    API.write('ImportPolicyTags', {
        policyID,
        tags: JSON.stringify(formattedTags),
    });
}

export {importPolicyTags};