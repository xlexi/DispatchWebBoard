import {isObject, isValidProperty} from './Validation.js';

/**
 * Maps included relationship data to the relationship of the main data model.
 *
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
export function mapRelationships(data) {
  // Ensure some level of integrity, just to be safe.
  if (!isObject(data) || 
      !isValidProperty(data, 'data', ['array', 'object'])) {
    throw TypeError('Invalid data model');
  }

  if (!isValidProperty(data, 'included', 'array')) {
    return data;
  }

  if(Array.isArray(data.data)) {
    for (let dataItem of data.data) {
      dataItem.relationships = mapRelationshipItems(dataItem.relationships, data.included);
    }
  } else if (isObject(data.data)) {
    data.data.relationships = mapRelationshipItems(data.data.relationships, data.included);
  }
  
  return data;
}

function findInclude(member, included) {
  let includeMatches = included.filter(obj => !obj.id || !obj.type ? false : obj.id === member.id && obj.type === member.type);
  if (includeMatches.length > 1) { 
    window.console.error('fr.user.mapProfileRelationships.findInclude - Multiple matches to included filter: ', includeMatches);
  }
  return includeMatches[0];
}

function mapRelationshipItems(relationships, included) {

  if(!isObject(relationships) || !Array.isArray(included)) { throw TypeError('Invalid Parameter Types.'); }

  for(let relationship of relationships) {

    if(Array.isArray(relationship.data) && relationship.data.length > 0) {
      for (let relMember of relationship.data) {
        if(relMember && relMember.id && relMember.type) {
          relationship[relMember.id] = findInclude(relMember, included);
          if (relationship[relMember.id].relationships) {
            relationship[relMember.id].relationships = mapRelationshipItems(relationship[relMember.id].relationships, included);
          }
        }
      }
    } else if (isObject(relationship.data)) {

      let relMember = relationship.data;
      if(relMember && relMember.id && relMember.type) {
        relationship[relMember.id] = findInclude(relMember, included);
        if (relationship[relMember.id].relationships) {
          relationship[relMember.id].relationships = mapRelationshipItems(relationship[relMember.id].relationships, included);
        }
      }
    }

    delete relationship.data;

  }
  return relationships;
}