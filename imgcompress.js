/**
 * Auto: Ivan
 * date: 2014.10.29
 * email: 403704409@qq.com
 */
/*
    图片优化插件
    需求：
        必须按指定的图片比例，比例可以由外部设定
        当图片太大时，压缩图片(如；大于300K时就压缩，小于300k的直接上传原图)

    逻辑:
        1.上传的图片不符合比例的，直接不给上传，并给出提示，返回false
        2.如果图片 < 300K，返回false,直接用原图
        2.如果图片 > 300kb时，用canvas进行压缩
        3.压缩时，如果上传的图片尺寸比指定的尺寸要
            a.大时： 直接缩小到指定尺寸，压缩系数由canvas自动识别
            b.要小时, 按上传的原尺寸进行压缩,压缩系数为0.8
        3.压缩后返回64base的图片数据
        

    调用方法：
        var oImgCompress = new ImgCompress();
        oImgCompress.init({ width: 640, height: 220, maxSize: 300 }, function (response){ } );

        属性：
            
    name: ImgCompress, 

 */
define(function (require){

    var obj = null;

    function ImgCompress(){

        //单例模式
        if( !obj ){
            obj = this;
            //创建canvas
            var oCanvas = document.createElement('canvas');
            oCanvas.id = 'canvas'+Math.random();
            oCanvas.style.backgroundColor = 'black';
            oCanvas.style.display = 'none';
            document.body.appendChild(oCanvas);
            this.canva = oCanvas;
        }else{
            return obj;
        }   

        this.response = {
           fail: {type: -1, msg: "不符合压缩比例", data: false},
           same: {type: 0, msg: "不用压缩", data: false},
           done: {type: 1, msg: "压缩成功", data: null}
        };
        
        //上传图片数据
        this.uploadData = {
            width: 0,
            height: 0,
            scale: 1
        };

        //压缩图片数据
        this.compressData = {
            width: 0,
            height: 0,
            scale: 1,
            maxSize: 300
        };

    }

    ImgCompress.prototype = {

        init: function (opts, fn){
            var self = this;

            self.fn = fn;
            
            self.file = opts.file;
            self._compressImg = '';

            self.compressData.width = opts.width;
            self.compressData.height = opts.height;
            self.compressData.scale = opts.width / opts.height;
            self.compressData.maxSize = opts.maxSize * 1024;

            self._setUp();
        },

        _setUp: function ( fn ){
            var self = this;

            //获取上传图片
            var url = webkitURL.createObjectURL( self.file );
            var oImg = new Image();
            oImg.src = url;

            oImg.onload = function() {
                
                //上传图片数据
                self.uploadData.width = oImg.width;
                self.uploadData.height = oImg.height;
                self.uploadData.scale = self.uploadData.width / self.uploadData.height;

                //不符合比例
                if( self.compressData.scale !== self.uploadData.scale ){
                    self.fn && self.fn(self.response.fail);
                }else{
                    //如果图片太大,就压缩
                    if( self.file.size > self.compressData.maxSize ){
                        var data = self._setupCompress.call(self, oImg);

                        self.response.done.data = data;
                        self.fn && self.fn(self.response.done);
                    }else{                    
                        self.fn && self.fn(self.response.same);
                    }
                }
     
            };
        },

        //压缩图片
        _setupCompress: function (oImg){
            var self = this;
            var oContext = self.canva.getContext('2d');

            //压缩的尺寸
            var compressW = self.uploadData.width,    
                compressH = self.uploadData.height;
            var bResetDimention = self.uploadData.width > self.compressData.width ? true : false;  //如果大于指定尺寸,就要裁成指定尺寸                    
            if(  bResetDimention  ){                        
                compressW = self.compressData.width;
                compressH = self.compressData.height;
            }

            //把图画到canvas上
            $( self.canva ).attr( {width : compressW, height : compressH} );
            oContext.drawImage(oImg, 0, 0, compressW, compressH);

            //拿canvas上的图像数据
            if( bResetDimention ){                        
                self._compressImg = self.canva.toDataURL('image/jpeg');
            }else{
                self._compressImg = self.canva.toDataURL('image/jpeg', 0.8);
            }

            return self._compressImg;
        },    

        getData: function (){       
            return this._compressImg;
        },

        constructor: ImgCompress

    };

    return ImgCompress;
});
