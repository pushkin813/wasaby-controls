define([ 'Controls/moverDialog'], function(moverDialog) {
   describe('Controls.moverDialog', function() {
      it('getDefaultOptions', function() {
         assert.deepEqual(moverDialog.Template.getDefaultOptions(), {
            root: null
         });
      });
   });
});
