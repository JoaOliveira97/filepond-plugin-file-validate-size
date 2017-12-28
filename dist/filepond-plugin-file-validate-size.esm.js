/*
 * FilePondPluginFileValidateSize 1.0.0
 * Licensed under MIT, https://opensource.org/licenses/MIT
 * Please visit https://pqina.nl/filepond for details.
 */
var plugin$1 = ({ addFilter, utils }) => {
  // get quick reference to Type utils
  const { Type, replaceInString, toNaturalFileSize } = utils;

  // adds options to options register
  addFilter('SET_DEFAULT_OPTIONS', options =>
    Object.assign(options, {
      // Enable or disable file type validation
      allowFileSizeValidation: [true, Type.BOOLEAN],

      // Max individual file size in bytes
      maxFileSize: [null, Type.INT],

      // Max total file size in bytes
      maxTotalFileSize: [null, Type.INT],

      // error labels
      labelMaxFileSizeExceeded: ['File is too large', Type.STRING],
      labelMaxFileSize: ['Maximum file size is {filesize}', Type.STRING],
      labelMaxTotalFileSizeExceeded: [
        'Maximum total size exceeded',
        Type.STRING
      ],
      labelMaxTotalFileSize: [
        'Maximum total file size is {filesize}',
        Type.STRING
      ]
    })
  );

  // called for each file that is loaded
  // right before it is set to the item state
  // should return a promise
  addFilter(
    'LOAD_FILE',
    (file, { query }) =>
      new Promise((resolve, reject) => {
        // if not allowed, all fine, exit
        const allowFileSizeValidation = query('GET_ALLOW_FILE_SIZE_VALIDATION');
        if (!allowFileSizeValidation) {
          resolve(file);
          return;
        }

        // reject or resolve based on file size
        const sizeMax = query('GET_MAX_FILE_SIZE');
        if (sizeMax !== null && file.size > sizeMax) {
          reject({
            status: {
              main: query('GET_LABEL_MAX_FILE_SIZE_EXCEEDED'),
              sub: replaceInString(query('GET_LABEL_MAX_FILE_SIZE'), {
                filesize: toNaturalFileSize(sizeMax)
              })
            }
          });
          return;
        }

        // returns the current option value
        const totalSizeMax = query('GET_MAX_TOTAL_FILE_SIZE');
        if (totalSizeMax !== null) {
          // get the current total file size
          const currentTotalSize = query('GET_ITEMS').reduce((total, item) => {
            return total + item.fileSize;
          }, 0);

          // get the size of the new file
          if (currentTotalSize + file.size > totalSizeMax) {
            reject({
              status: {
                main: query('GET_LABEL_MAX_TOTAL_FILE_SIZE_EXCEEDED'),
                sub: replaceInString(query('GET_LABEL_MAX_TOTAL_FILE_SIZE'), {
                  filesize: toNaturalFileSize(totalSizeMax)
                })
              }
            });
            return;
          }
        }

        // file is fine, let's pass it back
        resolve(file);
      })
  );
};

if (document) {
  // plugin has loaded
  document.dispatchEvent(
    new CustomEvent('FilePond:pluginloaded', { detail: plugin$1 })
  );
}

export default plugin$1;
