/**
 * Created by kraynovdo on 07.02.2018.
 */
define([
   'Controls/Controllers/SourceController',
   'WS.Data/Source/Memory',
   'Core/core-instance'
], function(SourceController, MemorySource, cInstance){
   describe('Controls.Controllers.SourceController', function () {
      var data, source;
      beforeEach(function() {
         data = [
            {
               id : 1,
               title : 'Первый',
               type: 1
            },
            {
               id : 2,
               title : 'Второй',
               type: 2
            },
            {
               id : 3,
               title : 'Третий',
               type: 2
            }
         ];
         source = new MemorySource({
            data: data,
            idProperty: 'id'
         });

      });

      it('load', function (done) {
         var controller = new SourceController({
            source: source
         });

         var def = controller.load();
         assert.isTrue(controller.isLoading(), 'Wrong _isloading value');
         def.addCallback(function(rs){
            assert.isFalse(controller.isLoading(), 'Wrong _isloading value');
            assert.isTrue(cInstance.instanceOfModule(rs, 'WS.Data/Collection/RecordSet'), 'load doesn\'t returns recordset instance');
            assert.equal(3, rs.getCount(), 'load doesn\'t returns recordset instance');
            controller.destroy();
            done();
         });


      });

      it('load + navigation', function (done) {
         var controller = new SourceController({
            source: source,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 1,
                  mode: 'totalCount'
               }
            }

         });
         controller.load().addCallback(function(rs){
            assert.isTrue(cInstance.instanceOfModule(rs, 'WS.Data/Collection/RecordSet'), 'load doesn\'t returns recordset instance');
            assert.equal(1, rs.getCount(), 'Load doesn\'t returns correct records count');

            assert.isTrue(controller.hasMoreData('down'), 'Wrong has more value after load');
            assert.isFalse(controller.hasMoreData('up'), 'Wrong has more value after load');
            controller.destroy();
            done();
         });
      });

      it('modifyQueryParamsWithNavigation', function () {
         var controller = new SourceController({
            source: source,
            navigation: {
               source: 'page',
               sourceConfig: {
                  pageSize: 10,
                  mode: 'totalCount'
               }
            }
         });
         var resParams = SourceController._private.modifyQueryParamsWithNavigation({filter: {}}, null, controller._queryParamsController);
         assert.deepEqual({filter:{}, limit: 10, offset: 0}, resParams, 'Wrong query params in page navigation');

         controller = new SourceController({
            source: source,
            navigation: {
               source: 'position',
               sourceConfig: {
                  limit: 10,
                  field: 'id',
                  direction: 'after',
                  position: 2
               }
            }
         });
         resParams = SourceController._private.modifyQueryParamsWithNavigation({filter: {}}, null, controller._queryParamsController);
         assert.deepEqual({limit: 10, offset: undefined, filter: {'id>=': 2}}, resParams, 'Wrong query params in position navigation');

         var originalFilter = {};
         resParams = SourceController._private.modifyQueryParamsWithNavigation({filter: {}}, null, controller._queryParamsController);
         assert.notEqual(originalFilter, resParams.filter, 'Modified filter should be a new object instance');
      });

      it('filters', function (done) {
         var controller = new SourceController({
            source: source
         });
         controller.load({id: 2}).addCallback(function(rs){
            assert.equal(1, rs.getCount(), 'Load with filter doesn\'t returns correct records count');
            done();
         });

      });

      it('sorting', function (done) {
         var controller = new SourceController({
            source: source
         });
         controller.load({}, [{id: 'DESC'}]).addCallback(function(rs){

            assert.equal(3, rs.getCount(), 'Load with sorting doesn\'t returns correct records count');
            assert.equal(3, rs.at(0).get('id'), 'Load with sorting doesn\'t returns correct records order');

            done();
         });

      });
   })
});
