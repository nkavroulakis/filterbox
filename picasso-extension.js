define([
  './external/picasso.min',
  './external/picasso-q.min',
  'qlik'
], function (
  picasso,
  picassoQ,
  qlik
) {
    picasso.use(picassoQ); // register q plugin

    /************************/

    var box = function (opts) {
      const b = {
        key: opts.id,
        type: 'box',
        data: {
          extract: {
            field: 'qDimensionInfo/0',
            props: {
              start: opts.start,
              end: opts.end
            }
          }
        },
        settings: {
          orientation: 'horizontal',
          major: { scale: 'y' },
          minor: { scale: 'v' },
          box: {
            width: opts.width,
            fill: opts.fill,
            minHeightPx: opts.minHeightPx
          }
        }
      };

      if (opts.color) {
        b.data.extract.props.fill = opts.color;
        b.settings.box.fill = { ref: 'fill' };
      }

      return b;
    }

    var labels = function (opts) {
      return {
        type: 'labels',
        key: 'labels-' + opts.c,
        displayOrder: 2,
        settings: {
          sources: [{
            component: opts.c,
            selector: 'rect',
            strategy: {
              type: 'bar',
              settings: {
                direction: 'right',
                fontSize: opts.fontSize || 16,
                align: 'align' in opts ? opts.align : 0.5,
                labels: [{
                  placements: [{
                    position: opts.position || 'inside',
                    fill: opts.fill || '#111',
                    justify: 'justify' in opts ? opts.justify : 0
                  }],
                  label: function label(d) {
                    //console.log(d);
                    return (d.data.end.label);
                  }
                }]
              }
            }
          }]
        }
      };
    }


    /***********************/

    return {
      definition: { // property panel definition
        type: 'items',
        component: 'accordion',
        items: {
          dimensions: {
            uses: "dimensions",
            min: 0,
            max: 1
          },
          measures: {
            uses: "measures",
            min: 1,
            max: 2
          },
          sorting: {
            uses: "sorting"
          },
          data: {
            uses: 'data'
          },
          settings: {
            uses: 'settings'
          },
        },
      },
      initialProperties: {
        qHyperCubeDef: { // basic hypercube setup
          qDimensions: [],
          qMeasures: [],
          qInitialDataFetch: [
            { qWidth: 10, qHeight: 500 },
          ],
          qSuppressZero: false,
          qSuppressMissing: true,
        }
      },

      // resize: function ($element, layout) {
      //   if (this.chart) {
      //     this.chart.update();
      //   }
      //   return this.paint($element, layout);
      // },

      paint: function ($element, layout) {

        if (!this.chart) { // instantiate picasso chart on first time render
          this.chart = picasso.chart({
            element: $element[0],
            data: []
          })
        }

        this.chart.update({
          data: [{ // pass in hypercube
            type: 'q',
            key: 'qHyperCube',
            data: layout.qHyperCube
          }],
          settings: {

            // ******************************************************************************
            // What is what? ... needs 1 Dim, 2 Measures
            // source: https://beta.observablehq.com/@miralemd/picasso-js-labeling-bars
            // Dim --> qDimensionInfo/0
            // Measure --> qMeasureInfo/0
            // Target --> qMeasureInfo/1

            collections: [{
              key: 'd',
              data: {
                extract: {
                  field: 'qDimensionInfo/0',
                  props: {
                    start: { field: 'qMeasureInfo/0' },
                    end: { field: 'qMeasureInfo/1' }
                  }
                }
              }
            }],
            scales: {
              y: {
                data: { extract: { field: 'qDimensionInfo/0' } },
                padding: 0.1
              },
              v: {
                data: { fields: ['qMeasureInfo/0', 'qMeasureInfo/1'] },
                expand: 0.1,
                min: 0,
              }
            },
            components: [
              /*
              {
                type: 'axis',
                dock: 'left',
                scale: 'y'
              }
              ,{
                type: 'axis',
                dock: 'bottom',
                scale: 'v'
              } */
              box({
                id: 'bars',
                start: 0,
                end: { field: 'qMeasureInfo/0' },
                width: 0.5,
                fill: '#fa0',
                color: layout.qHyperCube.qMeasureInfo[2] ? { field: 'qMeasureInfo/2', value: function (v) { return v.qText; } } : undefined,
              })
              , box({ id: 'target', start: { field: 'qMeasureInfo/1' }, end: { field: 'qMeasureInfo/1' }, width: 1.0, fill: '#111', minHeightPx: 3 })
              , labels({ c: 'bars' })
              , labels({ c: 'target', position: 'opposite', align: 0, fontSize: 11, fill: '#666' })
            ]


            // ******************************************************************************

            /*
                      scales: {
                        // use measure for the scale
                        x: { data: { field: 'qMeasureInfo/0' }, expand: 0.1 }
                      },
                      components: [{
                        // render points distributed along the x axis
                        type: 'point',
                        data: {
                          extract: {
                            field: 'qDimensionInfo/0',
                            props: {
                              x: { field: 'qMeasureInfo/0' }
                            }
                          }
                        },
                        settings: {
                          x: { scale: 'x' }
                        }
                      }]
            
            */

          }
        });
      }/*,
    resize() {
      this.chart.update();
    }*/
    };

  });
