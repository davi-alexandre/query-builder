/** Adds or/and-then removes the specified params and returns the current route with the resultant query */
export function makeQuery(
  currentQuery: string,
  { add: paramsToAdd = {}, rem: paramsToRemove = {} }: ParamsOptions,
) {
  const currentSearchParams = new URLSearchParams(currentQuery);
  const result1 = from(currentSearchParams).remove(paramsToRemove);
  const result2 = from(result1).add(paramsToAdd);
  return result2.toString();
}

function from(currentSearchParams: URLSearchParams) {
  currentSearchParams = cloneSearchParams(currentSearchParams);
  const currentKeys = Array.from(currentSearchParams.keys());
  const resultantSearchParams = cloneSearchParams(currentSearchParams);
  return {
    remove: function (paramsToRemove: ParamsToRemove) {
      for (const key of currentKeys) {
        const currentValues = currentSearchParams.getAll(key);
        let updatedValues = [...currentValues];

        if (Object.hasOwn(paramsToRemove, key)) {
          const remValue = paramsToRemove[key];
          let remValues: string[];
          if (remValue === '*') {
            updatedValues = [];
            remValues = [];
          } else if (typeof remValue === 'string') {
            remValues = [remValue];
          } else {
            remValues = remValue;
          }
          const index = updatedValues.findIndex((v) => remValues.includes(v));
          if (index !== -1) updatedValues.splice(index, 1);
        }
        this.update(key, updatedValues);
      }
      return resultantSearchParams;
    },
    add: function (paramsToAdd: ParamsToAdd) {
      for (const key of Object.keys(paramsToAdd)) {
        const currentValues = currentSearchParams.getAll(key);
        let valuesToAdd: string[] = [];
        if (Object.hasOwn(paramsToAdd, key)) {
          valuesToAdd =
            typeof paramsToAdd[key] === 'object'
              ? (paramsToAdd[key] as string[])
              : [paramsToAdd[key] as string];
        }
        const updatedValues = [...currentValues, ...valuesToAdd];
        this.update(key, updatedValues);
      }
      return resultantSearchParams;
    },
    update: function (key: string, values: string[]) {
      resultantSearchParams.delete(key);
      values.forEach((q) => {
        resultantSearchParams.append(key, q);
      });
    },
  };
}

function cloneSearchParams(params: URLSearchParams) {
  return new URLSearchParams(params);
}

type ParamsOptions = {
  add?: ParamsToAdd;
  rem?: ParamsToRemove;
};
type ParamsToRemove = Record<string, string[] | (string & {}) | '*'>;
type ParamsToAdd = Record<string, string[] | string>;