function InfToJSON(k, v) {
  if (v === Infinity) {
    return 'Infinity';
  } else if (v === -Infinity) {
    return '-Infinity';
  } else {
    return v;
  }
}

function InfFromJSON(k, v) {
  if (v === 'Infinity') {
    return Infinity;
  } else if (v === '-Infinity') {
    return -Infinity;
  } else {
    return v;
  }
}

function serialize(o) {
  return JSON.stringify(o, InfToJSON);
}

module.exports = serialize;
