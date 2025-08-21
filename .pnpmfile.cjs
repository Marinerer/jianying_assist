module.exports = {
  hooks: {
    readPackage(pkg, context) {
      if (pkg.name === 'electron') {
        delete pkg.scripts?.postinstall;
      }
      return pkg;
    },
  },
};