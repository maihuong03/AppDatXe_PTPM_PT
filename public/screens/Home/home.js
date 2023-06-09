// import * as AppUserConstant from '../HomeArea/AppUserConstant';
// var appUserType = AppUserConstant;
// var a = appUserType.Customer;

var QuangDuong = '';
var ThoiGian = '';
var Money = '';
var LoactionFrom = '';
var LocationTo = '';
var socket = io.connect('http://localhost:3000');
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 2,
});
if (
    sessionStorage.getItem('LoginId') != null &&
    sessionStorage.getItem('LoginId') != ''
) {
    $.ajax({
        url: '/api/appuser/' + sessionStorage.getItem('LoginId'),
        type: 'GET',
    }).done(function (data) {
        DisplayUserInfo(data);
    });
}
var layer = 'streets-v11';
if (
    sessionStorage.getItem('mapLayer') != null &&
    sessionStorage.getItem('mapLayer') != ''
) {
    layer = sessionStorage.getItem('mapLayer');
    $('#' + layer).prop('checked', true);
} else {
    $('#streets-v11').prop('checked', true);
}
mapboxgl.accessToken =
    'pk.eyJ1IjoibWluaG50dXllbiIsImEiOiJjazEwNWkyMWcwMjRhM2hwYmVybWlmenN4In0.w81DZILIiJNnmQV4Dg6JYA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/' + layer,
    center: [105.8444083, 21.004097599999998],
    zoom: 15,
});
var dataProvince = {
    type: 'FeatureCollection',
    features: [],
};
map.on('load', function () {
    map.loadImage('/image/car.png', function (error, image) {
        map.addImage('CarIcon', image);
    });
    map.loadImage('/image/map-marker.png', function (error, image) {
        map.addImage('UserIcon', image);
    });
});
if (sessionStorage.getItem('userType') == 'Customer') {
    $('#isLoginDriver').hide();
    $('#isLogin').show();
    $('#isNotLogin').hide();
} else if (sessionStorage.getItem('userType') == 'Driver') {
    $('#isLoginDriver').show();
    $('#isLogin').hide();
    $('#isNotLogin').hide();
} else {
    $('#isLoginDriver').hide();
    $('#isLogin').hide();
    $('#isNotLogin').show();
}
function getMeters(i) {
    return i * 1609;
}
function getKiloMeters(i) {
    return i / 1000;
}
function ConvertToMinute(time) {
    var hourPosition = time.search('h');
    var minutePosition = time.search('min');
    if (hourPosition == -1) {
        return (time = time.slice(0, minutePosition));
    } else {
        var hour = time.slice(0, hourPosition);
        var minute = time.slice(hourPosition + 2, minutePosition);
        return (time = parseInt(minute, 10) + parseInt(hour, 10) * 60);
    }
}
function calculateMoney(long, time) {
    /*Công thức tính cước phí grab
    Giá tối thiểu 2 km đầu tiên là 12.000đ
    Giá cước mỗi km tiếp theo là 3.500đ
    Giá tính theo thời gian di chuyển (sau 2km đầu tiên) 350đ/phút
    */
    long = getKiloMeters(getMeters(long));
    if (long <= 2) {
        return long * 12000;
    } else {
        return 2 * 12000 + (long - 2) * 3500 + (parseInt(time) - 2) * 350;
    }
}
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
function getLocationDirectionGuest() {
    // var LoTrinhChuyenDi = map._controls[3].container.innerText;
    var LoTrinhChuyenDiMile = $('.mapbox-directions-route-summary h1').text();
    LoTrinhChuyenDiMile = LoTrinhChuyenDiMile.replace('mi', '');
    QuangDuong = LoTrinhChuyenDiMile;
    if (getMeters(LoTrinhChuyenDiMile) > 1000) {
        LoTrinhChuyenDiMile =
            getKiloMeters(getMeters(LoTrinhChuyenDiMile)).toLocaleString(
                undefined,
                { minimumFractionDigits: 0 }
            ) + 'km';
    } else {
        LoTrinhChuyenDiMile =
            getMeters(LoTrinhChuyenDiMile).toLocaleString(undefined, {
                minimumFractionDigits: 0,
            }) + 'm';
    }
    var LoTrinhChuyenDiTime = $('.mapbox-directions-route-summary span').text();
    ThoiGian = ConvertToMinute(LoTrinhChuyenDiTime);
    Money = calculateMoney(QuangDuong, ThoiGian);
    document.getElementById('LoTrinhChuyenDi').innerHTML =
        "<span style='font-size: 25px;'>" +
        LoTrinhChuyenDiMile +
        ' ' +
        LoTrinhChuyenDiTime +
        '</span>';
    document.getElementById('TienDi').innerHTML =
        "<span style='font-size: 25px;'>" + formatter.format(Money) + '</span>';
    LoactionFrom = $('#mapbox-directions-origin-input input').val();
    LocationTo = $('#mapbox-directions-destination-input input').val();
    console.log(LoactionFrom, LocationTo);
}
function findDriver() {
    dataProvince.features = [];
    var long = '';
    var lat = '';
    if (
        sessionStorage.getItem('Latitude') != null &&
        sessionStorage.getItem('Latitude') != '' &&
        sessionStorage.getItem('Longitude') != null &&
        sessionStorage.getItem('Longitude') != ''
    ) {
        lat = sessionStorage.getItem('Latitude');
        long = sessionStorage.getItem('Longitude');
        console.log(long, lat);
        console.log('/api/finddriver/' + lat + '/' + long);
        $.ajax({
            url: '/api/finddriver/' + lat + '/' + long,
            type: 'GET',
        }).done(function (data) {
            var driverBox = ``;
            var idx = 0;
            data.forEach((element) => {
                driverBox += `<div class="col-sm-6">
                <div class="col-sm-12 driverImage">
                    <div class="imgAvatar">
                        <img src="${element.Avatar}">
                    </div>
                        <div class="col-sm-12 driverInfo">
                            <span>Lái xe: <b>${ShowMessageIfEmpty(
                                element.username
                            )}</b></span>
                            <span>Biển số xe: <b>${ShowMessageIfEmpty(
                                element.BikeLicensePlace
                            )}</b></span>
                            <span>Điện thoại: <b>${ShowMessageIfEmpty(
                                element.Phone
                            )}</b></span>
                            <div class="col-sm-12">
                                <button class="btn btn-sm" onclick="ChoseDriver('${
                                    element._id
                                }')">Chọn lái xe</button>
                            </div>
                        </div>
                    </div>
                </div>`;
                dataProvince.features[idx] = {
                    type: 'Feature',
                    properties: {
                        message: element.username,
                        MoTaLaiXe:
                            "<strong style='color:#428BCA;'>" +
                            element.username +
                            '</strong><br/><p>Biển số xe: ' +
                            element.BikeLicensePlace +
                            '</p><p>SĐT: ' +
                            element.Phone +
                            '</p>',
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            element.CurrentPosition[0].LongitudePosition,
                            element.CurrentPosition[0].LatitudePosition,
                        ],
                    },
                };
                idx += 1;
            });
            document.getElementById('driverGenerator').innerHTML = driverBox;
            if (map.getLayer('CarLayer')) {
                map.removeLayer('CarLayer');
            }
            if (map.getSource('CarSource')) {
                window.setInterval(function () {
                    map.getSource('CarSource').setData(dataProvince);
                }, 2000);
            } else {
                map.addSource('CarSource', {
                    type: 'geojson',
                    data: dataProvince,
                });
            }
            map.addLayer({
                id: 'CarLayer',
                type: 'symbol',
                source: 'CarSource',
                layout: {
                    'text-field': ['get', 'message'],
                    'text-size': 10,
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-radial-offset': 0.5,
                    'text-justify': 'auto',
                    'icon-image': 'CarIcon',
                    'icon-size': 0.08,
                    'text-max-width': 8,
                },
            });
            map.on('click', 'CarLayer', function (e) {
                var coordinates = e.features[0].geometry.coordinates;
                var MoTaLaiXe = e.features[0].properties.MoTaLaiXe;
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] +=
                        e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                map.flyTo({
                    center: coordinates,
                });
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(MoTaLaiXe)
                    .addTo(map);
            });
            map.on('mouseenter', 'CarLayer', function () {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'CarLayer', function () {
                map.getCanvas().style.cursor = '';
            });
        });
    }
}
function ChoseDriver(id) {
    console.log(id);
    $('#mapCurrentPosition2').hide();
    $('#InputLocation').hide();
    $('#LocationDirectionGuest').hide();
    $('#CallDriver').hide();
    $('#driverGenerator').hide();
    $('#driverPickerAreaInfo').show();
    $.ajax({
        url: '/api/chosedriver/' + id,
        type: 'GET',
    }).done(function (data) {
        console.log(data);
        var driverBoxInfo = `<div class="col-sm-12 driverImage">
        <div class="imgAvatar">
            <img src="${data[0].Avatar}">
        </div>
            <div class="col-sm-12 driverInfoPickup">
                <span>Lái xe: <b>${ShowMessageIfEmpty(
                    data[0].username
                )}</b></span>
                <span>Biển số xe: <b>${ShowMessageIfEmpty(
                    data[0].BikeLicensePlace
                )}</b></span>
                <span>Điện thoại: <b>${ShowMessageIfEmpty(
                    data[0].Phone
                )}</b></span>
                <div class="col-sm-12" id="CloseChoseDriver">
                    <button class="btn btn-sm" onclick="PaymentDriver('${
                        data[0]._id
                    }')">Thanh toán</button>
                    <button class="btn btn-sm" id="CancelDrive" onclick="CloseChoseDriver()">Hủy chuyến</button>
                </div>
            </div>
        </div>`;
        document.getElementById('driverPickerAreaInfo').innerHTML =
            driverBoxInfo;
    });
    var OriginLocation = directions.getOrigin().geometry.coordinates;
    var DirectionLocation = directions.getDestination().geometry.coordinates;
    console.log(OriginLocation, DirectionLocation);
    if (
        OriginLocation != null &&
        DirectionLocation != null &&
        OriginLocation != '' &&
        DirectionLocation != ''
    ) {
        socket.emit('send_customer_info', {
            OriginLocation: OriginLocation,
            DirectionLocation: DirectionLocation,
            DriverId: id,
            CurentUserId: sessionStorage.getItem('LoginId'),
        });
    }
}
function CloseChoseDriver() {
    $('#mapCurrentPosition2').show();
    $('#InputLocation').show();
    $('#LocationDirectionGuest').show();
    $('#CallDriver').show();
    $('#driverGenerator').show();
    $('#driverPickerAreaInfo').hide();
    socket.emit('cancel_drive', { Cancel: true });
    location.reload();
}
function CloseChoseUser() {
    socket.emit('cancel_user', { Cancel: true });
    location.reload();
}
function PaymentDriver(id) {
    if (
        sessionStorage.getItem('LoginId') != null &&
        sessionStorage.getItem('LoginId') != ''
    ) {
        $.ajax({
            url: '/api/paymentdriver/',
            type: 'POST',
            data: {
                LoginId: sessionStorage.getItem('LoginId'),
                DriverId: id,
                Money: Money,
                LocationFrom: LoactionFrom,
                LocationTo: LocationTo,
            },
            success: (data) => {
                console.log('Thanh toán thành công!');
                document.getElementById('driverPickerAreaInfo').innerHTML =
                    document.getElementById('driverPickerAreaInfo').innerHTML +
                    `
                <div class="col-sm-12" style="padding:0px">
                    <div class="alert alert-success alert-dismissible fade in">
                        <a href="#" class="close" data-dismiss="alert" aria-label="close" style="top: -8px;">&times;</a>
                        <strong>Thanh toán thành công!</strong> Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
                    </div>
                </div>`;
                document.getElementById('CloseChoseDriver').innerHTML = `
                    <button class="btn btn-sm" onclick="CloseChoseDriver()"style="width: 95%;">Đóng</button>
                `;
            },
        });
        $.ajax({
            url: '/api/getmoney/' + sessionStorage.getItem('LoginId'),
            type: 'GET',
        }).done(function (data) {
            setTimeout(function () {
                document.getElementById('moneyArea').innerHTML =
                    data[0].money + ' VNĐ';
            }, 5000);
        });

        socket.emit('payment', { Pay: true });
    }
}

$('#BikeLicensePlaceRegister').hide();
$('#BikeLicensePlaceText').hide();
function ChoseUserType() {
    if (document.getElementById('UserTypeRegister').value == 'Driver') {
        $('#BikeLicensePlaceRegister').show();
        $('#BikeLicensePlaceText').show();
    } else {
        $('#BikeLicensePlaceRegister').hide();
        $('#BikeLicensePlaceText').hide();
    }
}
document.getElementById('register-button').addEventListener('click', (e) => {
    let Email = document.getElementById('EmailRegister').value;
    let Password = document.getElementById('PasswordREgister').value;
    let username = document.getElementById('usernameRegister').value;
    let Phone = document.getElementById('PhoneRegister').value;
    let userType = document.getElementById('UserTypeRegister').value;
    let BikeLicensePlace = document.getElementById(
        'BikeLicensePlaceRegister'
    ).value;
    if (
        Email == '' ||
        Email == null ||
        Password == '' ||
        Password == null ||
        username == '' ||
        username == null ||
        Phone == '' ||
        Phone == null
    ) {
        PopupError('Bạn chưa nhập đầy đủ thông tin đăng ký!');
    } else {
        console.log(userType);
        if (userType != '-1') {
            if ($('#BikeLicensePlaceRegister').css('display') == 'none') {
                $.ajax({
                    url: '/api/appuser',
                    type: 'POST',
                    data: {
                        Email: Email,
                        Password: Password,
                        username: username,
                        Phone: Phone,userType,
                        BikeLicensePlace: BikeLicensePlace,
                    },
                    success: (data) => {
                        console.log(data);
                        console.log(
                            'Đăng ký tài khoản thành công!<br/>Vui lòng đăng nhập lại'
                        );
                        // sessionStorage.setItem("userType", UserType);
                        // sessionStorage.setItem("LoginId", data._id);
                        $('.close').click();
                        PopupSuccess(
                            'Đăng ký tài khoản thành công!<br/>Vui lòng đăng nhập lại'
                        );
                        // if (UserType == "Customer") {
                        //     $("#isLoginDriver").hide();
                        //     $("#isLogin").show();
                        //     $("#isNotLogin").hide();
                        // }
                        // else if (UserType == "Driver") {
                        //     $("#isLoginDriver").show();
                        //     $("#isLogin").hide();
                        //     $("#isNotLogin").hide();
                        // }
                        jQuery.noConflict();
                        $('#myModalLogin').modal('show');
                    },
                    error: (error) => {
                        console.log(error);
                        PopupError('Email này đã có người đăng ký!');
                    },
                });
            } else if (
                $('#BikeLicensePlaceRegister').css('display') != 'none'
            ) {
                if (BikeLicensePlace == '' || BikeLicensePlace == null) {
                    PopupError('Bạn chưa nhập biển số xe!');
                } else {
                    $.ajax({
                        url: '/api/appuser',
                        type: 'POST',
                        data: {
                            Email: Email,
                            Password: Password,
                            username: username,
                            Phone: Phone,userType,
                            BikeLicensePlace: BikeLicensePlace,
                        },
                        success: (data) => {
                            console.log(
                                'Đăng ký tài khoản thành công!<br/>Vui lòng đăng nhập lại'
                            );
                            // sessionStorage.setItem("userType", UserType);
                            // sessionStorage.setItem("LoginId", data._id);
                            $('.close').click();
                            PopupSuccess(
                                'Đăng ký tài khoản thành công!<br/>Vui lòng đăng nhập lại'
                            );
                            // if (UserType == "Customer") {
                            //     $("#isLoginDriver").hide();
                            //     $("#isLogin").show();
                            //     $("#isNotLogin").hide();
                            // }
                            // else if (UserType == "Driver") {
                            //     $("#isLoginDriver").show();
                            //     $("#isLogin").hide();
                            //     $("#isNotLogin").hide();
                            // }
                            jQuery.noConflict();
                            $('#myModalLogin').modal('show');
                        },
                        error: (error) => {
                            console.log(error);
                            PopupError('Email này đã có người đăng ký!');
                        },
                    });
                }
            }
        } else if (userType == '-1') {
            PopupError('Bạn chưa chọn loại người dùng!');
        }
    }
});
document.getElementById('login-button').addEventListener('click', (e) => {

    let Email = document.getElementById('PhonenumberLogin').value;
    let Password = document.getElementById('PasswordLogin').value;
    if (Email == '' || Password == '' || Email == null || Password == null) {
        PopupError('Bạn chưa nhập Email và mật khẩu đăng nhập!');
    } else {
        $.ajax({
            url: '/api/appuser/' + Email + '/' + Password,
            type: 'GET',
            success: (data) => {
                console.log('Đăng nhập tài khoản thành công!');
                console.log(data);
                sessionStorage.setItem('userType', data.userType);
                sessionStorage.setItem('LoginId', data._id);
                $('.close').click();
                if (data.userType == 'Customer') {
                    $('#isLoginDriver').hide();
                    $('#isLogin').show();
                    $('#isNotLogin').hide();
                } else if (data.userType == 'Driver') {
                    $('#isLoginDriver').show();
                    $('#isLogin').hide();
                    $('#isNotLogin').hide();
                    $('#InputLocation').hide();
                    $('#LocationDirectionGuest').hide();
                    $('#CallDriver').hide();
                    document.getElementById('mapItemtab1MoneyName').innerHTML =
                        'SỐ TIỀN NHẬN ĐƯỢC:';
                }
                DisplayUserInfo(data);
                PopupSuccess('Đăng nhập tài khoản thành công!');
                document.getElementById('moneyArea').innerHTML =
                    data.money + ' VNĐ';
            },
            error: (error) => {
                console.log(error);
                PopupError('Sai Email hoặc mật khẩu đăng nhập!');
            },
        });
    }
});
document.getElementById('logOut').addEventListener('click', (e) => {
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('LoginId');
    $('#isLoginDriver').hide();
    $('#isLogin').hide();
    $('#isNotLogin').show();
    PopupSuccess('Đăng xuất tài khoản thành công!');
    location.reload();
});
function logOut() {
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('LoginId');
    $('#isLoginDriver').hide();
    $('#isLogin').hide();
    $('#isNotLogin').show();
    PopupSuccess('Đăng xuất tài khoản thành công!');
    location.reload();
}
function Direction() {
    if ($('.mapbox-directions-instructions')[0]) {
        $('.mapbox-directions-instructions').hide();
    } else if (!$('.mapbox-directions-instructions')[0]) {
        $('.mapbox-directions-instructions').show();
    }
}
function openNavBar() {
    $('#closeNavBar').show();
    $('#openNavBar').hide();
}
function closeNavBar() {
    $('#closeNavBar').hide();
    $('#openNavBar').show();
}
function openSettingLayerButton() {
    $('#closeSetting').show();
    $('#openSetting').hide();
    $('#menu').show();
    layer = sessionStorage.getItem('mapLayer');
    $('#' + layer).prop('checked', true);
}
function closeSettingLayerButton() {
    $('#closeSetting').hide();
    $('#openSetting').show();
    $('#menu').hide();
}
var windowHeight = $(window).height() - 30;
var windowWidth = $(window).width() - 30;
var windowMinWidth = $(window).width() / 2 - 15;
function zoomMap() {
    $('#mapCurrentPosition').show();
    $('#zoomInMap').show();
    $('#zoomMap').hide();
    $('.mapItem').hide();
    $('.navBarArea').hide();
    $('#map').css('width', windowWidth);
    map.resize();
}
function zoomInMap() {
    $('#mapCurrentPosition').hide();
    $('#zoomInMap').hide();
    $('#zoomMap').show();
    $('.mapItem').show();
    $('.navBarArea').show();
    $('#map').css('width', windowMinWidth);
    map.resize();
}
$(document).ready(function () {
    $('#zoomInMap').hide();
    $('#mapCurrentPosition').hide();
    $('#map').css('height', windowHeight);
    $('.mapItem').css('height', windowHeight + 30);
    $('#closeSetting').hide();
    $('#closeNavBar').hide();
    $('#menu').hide();
});
var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
});
function getInputLocation() {
    if (!$('.mapboxgl-ctrl-directions')[0]) {
        map.addControl(directions, 'top-left');
    }
    var visibility = map.getLayoutProperty('points', 'visibility');
    console.log(visibility);
    if (visibility === 'visible') {
        map.setLayoutProperty('points', 'visibility', 'none');
    } else {
        map.setLayoutProperty('points', 'visibility', 'visible');
    }

    if (
        sessionStorage.getItem('Latitude') != null &&
        sessionStorage.getItem('Latitude') != '' &&
        sessionStorage.getItem('Longitude') != null &&
        sessionStorage.getItem('Longitude') != ''
    ) {
        $('#mapbox-directions-origin-input input').val(
            sessionStorage.getItem('Longitude') +
                ',' +
                sessionStorage.getItem('Latitude')
        );
    }
    $('#mapbox-directions-origin-input input').focus();
}

// var x = document.getElementById("demo");
function getLocation() {
    var visibility = map.getLayoutProperty('points', 'visibility');
    if (visibility === 'visible') {
        map.setLayoutProperty('points', 'visibility', 'none');
    } else {
        map.setLayoutProperty('points', 'visibility', 'visible');
    }
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition);
    } else {
        // x.innerHTML = "Geolocation is not supported by this browser.";
    }
    var Longtitude = sessionStorage.getItem('Longitude');
    var Lattitude = sessionStorage.getItem('Latitude');
    if (
        sessionStorage.getItem('LoginId') != null &&
        sessionStorage.getItem('LoginId') != ''
    ) {
        $.ajax({
            url: '/api/updateuserlocation/',
            type: 'POST',
            data: {
                LoginId: sessionStorage.getItem('LoginId'),
                Longtitude: Longtitude,
                Lattitude: Lattitude,
            },
            success: (data) => {
                console.log(data);
            },
        });
    } else {
        PopupError(
            'Bạn cần đăng nhập hoặc đăng ký trước khi lấy vị trí hiện tại!'
        );
    }
}
if (
    sessionStorage.getItem('Latitude') != null &&
    sessionStorage.getItem('Latitude') != '' &&
    sessionStorage.getItem('Longitude') != null &&
    sessionStorage.getItem('Longitude') != ''
) {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/' + layer,
        center: [
            sessionStorage.getItem('Longitude'),
            sessionStorage.getItem('Latitude'),
        ],
        zoom: 15,
    });
}

$(function () {
    // Getter
    var minWidth = $('.selector').resizable('option', 'minWidth');
    // Setter
    $('.selector').resizable('option', 'minWidth', windowMinWidth);
    // Getter
    var maxWidth = $('.selector').resizable('option', 'maxWidth');
    // Setter
    $('.selector').resizable('option', 'maxWidth', windowWidth);
    // Getter
    var maxHeight = $('.selector').resizable('option', 'maxHeight');
    // Setter
    $('.selector').resizable('option', 'maxHeight', windowHeight);
    $('#map').resizable({
        maxHeight: windowHeight,
        maxWidth: windowWidth,
        minWidth: windowMinWidth,
    });
    map.resize();
});

$('#map').resize(function (e) {
    console.log($('#map').width(), windowWidth);
    if ($('#map').width() > windowMinWidth + 15) {
        $('#map').css('z-index', 10);
    } else {
        $('#map').css('z-index', 'unset');
    }
    if ($('#map').width() > windowWidth - 10) {
        $('#mapCurrentPosition').show();
        $('#zoomInMap').show();
        $('#zoomMap').hide();
        $('.mapItem').hide();
        $('#map').css('z-index', 'unset');
    } else {
        $('#mapCurrentPosition').hide();
        $('#zoomInMap').hide();
        $('#zoomMap').show();
        $('.mapItem').show();
        $('#map').css('z-index', 20);
    }
    map.resize();
});

map.addControl(new mapboxgl.NavigationControl());

var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

function switchLayer(layer) {
    var layerId = layer.target.id;
    layer = layerId;
    sessionStorage.setItem('mapLayer', layer);
    map.setStyle('mapbox://styles/mapbox/' + layerId);
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}
function showPosition(position) {
    // x.innerHTML = "Latitude: " + position.coords.latitude +
    //     "<br>Longitude: " + position.coords.longitude;
    if (
        sessionStorage.getItem('mapLayer') != null &&
        sessionStorage.getItem('mapLayer') != ''
    ) {
        layer = sessionStorage.getItem('mapLayer');
    }
    if (
        sessionStorage.getItem('Latitude') != null &&
        sessionStorage.getItem('Latitude') != '' &&
        sessionStorage.getItem('Longitude') != null &&
        sessionStorage.getItem('Longitude') != ''
    ) {
        map.flyTo({
            center: [
                sessionStorage.getItem('Longitude'),
                sessionStorage.getItem('Latitude'),
            ],
        });
    } else {
        sessionStorage.setItem('Latitude', position.coords.latitude);
        sessionStorage.setItem('Longitude', position.coords.longitude);
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/' + layer,
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 15,
        });
        map.addControl(new mapboxgl.NavigationControl());
        var size = 200;
        var pulsingDot = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),

            onAdd: function () {
                var canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext('2d');
            },

            render: function () {
                var duration = 1000;
                var t = (performance.now() % duration) / duration;

                var radius = (size / 2) * 0.3;
                var outerRadius = (size / 2) * 0.7 * t + radius;
                var context = this.context;

                // draw outer circle
                context.clearRect(0, 0, this.width, this.height);
                context.beginPath();
                context.arc(
                    this.width / 2,
                    this.height / 2,
                    outerRadius,
                    0,
                    Math.PI * 2
                );
                context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
                context.fill();

                // draw inner circle
                context.beginPath();
                context.arc(
                    this.width / 2,
                    this.height / 2,
                    radius,
                    0,
                    Math.PI * 2
                );
                context.fillStyle = 'rgba(255, 100, 100, 1)';
                context.strokeStyle = 'white';
                context.lineWidth = 2 + 4 * (1 - t);
                context.fill();
                context.stroke();

                // update this image's data with data from the canvas
                this.data = context.getImageData(
                    0,
                    0,
                    this.width,
                    this.height
                ).data;

                // keep the map repainting
                map.triggerRepaint();

                // return `true` to let the map know that the image was updated
                return true;
            },
        };

        function switchLayer(layer) {
            var layerId = layer.target.id;
            layer = layerId;
            sessionStorage.setItem('mapLayer', layer);
            map.setStyle('mapbox://styles/mapbox/' + layerId);
            showPosition(position);
        }

        for (var i = 0; i < inputs.length; i++) {
            inputs[i].onclick = switchLayer;
        }
        map.on('load', function () {
            map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

            map.addLayer({
                id: 'points',
                type: 'symbol',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [
                                        position.coords.longitude,
                                        position.coords.latitude,
                                    ],
                                },
                            },
                        ],
                    },
                },
                layout: {
                    'icon-image': 'pulsing-dot',
                },
            });
        });
    }
}

$(function () {
    //make connection

    //buttons and inputs
    var message = $('#message');
    var username = $('#username');
    var send_message = $('#send_message');
    var send_username = $('#send_username');
    var chatroom = $('#chatroom');
    var feedback = $('#feedback');
    var canceldrive = $('#Cancel_Drive');
    //Emit message
    send_message.click(function () {
        socket.emit('new_message', { message: message.val() });
    });

    socket.on('cancel_drive', (data) => {
        console.log(data);
        if (data.Cancel == true) {
            directions.removeRoutes();
            map.removeLayer('UserLayer');
            map.removeSource('UserSource');
            window.location.reload();
        }
    });

    socket.on('cancel_user', (data) => {
        console.log(data);
        if (data.Cancel == true) {
            window.location.reload();
        }
    });

    socket.on('payment', (data) => {
        console.log(data);
        if (data.Pay == true) {
            PopupSuccess('Khách hàng đã thanh toán cho bạn!');
            $.ajax({
                url: '/api/getmoney/' + sessionStorage.getItem('LoginId'),
                type: 'GET',
            }).done(function (data) {
                setTimeout(function () {
                    document.getElementById('moneyArea').innerHTML =
                        data[0].money + ' VNĐ';
                }, 5000);
            });
        }
    });

    //Listen on new_message
    socket.on('new_message', (data) => {
        feedback.html('');
        message.val('');
        chatroom.append(
            "<p class='message'>" + data.username + ': ' + data.message + '</p>'
        );
    });

    $('#message').keyup(function (e) {
        if (e.keyCode == 13) {
            socket.emit('new_message', { message: message.val() });
        }
    });

    socket.on('send_customer_info', (data) => {
        if (sessionStorage.getItem('userType') == 'Driver') {
            PopupSuccess('Khách hàng đã chọn bạn!<br/>Vui đến đón họ');
            map.addControl(directions, 'top-left');
            directions.setDestination(data.DirectionLocation);
            directions.setOrigin(data.OriginLocation);
            console.log(data);
            dataProvince.features = [];
            $.ajax({
                url: '/api/appuser/' + data.CurentUserId,
                type: 'GET',
            }).done(function (data) {
                console.log(data);
                var driverBoxInfo = `<div class="col-sm-12 driverImage">
                <div class="imgAvatar">
                    <img src="${data.Avatar}">
                </div>
                    <div class="col-sm-12 driverInfoPickup">
                        <span>Khách hàng: <b>${ShowMessageIfEmpty(
                            data.username
                        )}</b></span>
                        <span>Điện thoại: <b>${ShowMessageIfEmpty(
                            data.Phone
                        )}</b></span>
                        <div class="col-sm-12" id="CloseChoseDriver">
                            <button class="btn btn-sm" id="CancelDrive" onclick="CloseChoseUser()">Hủy chuyến</button>
                        </div>
                    </div>
                </div>`;
                document.getElementById('driverPickerAreaInfo').innerHTML =
                    driverBoxInfo;

                $('#driverGenerator').hide();
                dataProvince.features[0] = {
                    type: 'Feature',
                    properties: {
                        message: data.username,
                        MoTaLaiXe:
                            "<strong style='color:#428BCA;'>" +
                            data.username +
                            '</strong><br/><p>SĐT: ' +
                            data.Phone +
                            '</p>',
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            data.CurrentPosition[0].LongitudePosition,
                            data.CurrentPosition[0].LatitudePosition,
                        ],
                    },
                };
                // document.getElementById("driverGenerator").innerHTML = driverBox;
                if (map.getLayer('UserLayer')) {
                    map.removeLayer('UserLayer');
                }
                if (map.getSource('UserSource')) {
                    window.setInterval(function () {
                        map.getSource('UserSource').setData(dataProvince);
                    }, 2000);
                } else {
                    map.addSource('UserSource', {
                        type: 'geojson',
                        data: dataProvince,
                    });
                }
                map.addLayer({
                    id: 'UserLayer',
                    type: 'symbol',
                    source: 'UserSource',
                    layout: {
                        'text-field': ['get', 'message'],
                        'text-size': 10,
                        'text-variable-anchor': [
                            'top',
                            'bottom',
                            'left',
                            'right',
                        ],
                        'text-radial-offset': 0.5,
                        'text-justify': 'auto',
                        'icon-image': 'UserIcon',
                        'icon-size': 0.08,
                        'text-max-width': 8,
                    },
                });
                map.on('click', 'UserLayer', function (e) {
                    var coordinates = e.features[0].geometry.coordinates;
                    var MoTaLaiXe = e.features[0].properties.MoTaLaiXe;
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] +=
                            e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }
                    map.flyTo({
                        center: coordinates,
                    });
                    new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(MoTaLaiXe)
                        .addTo(map);
                });
                map.on('mouseenter', 'UserLayer', function () {
                    map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', 'UserLayer', function () {
                    map.getCanvas().style.cursor = '';
                });
            });
        }
        setTimeout(function () {
            var LoTrinhChuyenDiMile = $(
                '.mapbox-directions-route-summary h1'
            ).text();
            LoTrinhChuyenDiMile = LoTrinhChuyenDiMile.replace('mi', '');
            QuangDuong = LoTrinhChuyenDiMile;
            if (getMeters(LoTrinhChuyenDiMile) > 1000) {
                LoTrinhChuyenDiMile =
                    getKiloMeters(
                        getMeters(LoTrinhChuyenDiMile)
                    ).toLocaleString(undefined, { minimumFractionDigits: 0 }) +
                    'km';
            } else {
                LoTrinhChuyenDiMile =
                    getMeters(LoTrinhChuyenDiMile).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                    }) + 'm';
            }
            var LoTrinhChuyenDiTime = $(
                '.mapbox-directions-route-summary span'
            ).text();
            ThoiGian = ConvertToMinute(LoTrinhChuyenDiTime);
            Money = calculateMoney(QuangDuong, ThoiGian);
            document.getElementById('LoTrinhChuyenDi').innerHTML =
                "<span style='font-size: 25px;'>" +
                LoTrinhChuyenDiMile +
                ' ' +
                LoTrinhChuyenDiTime +
                '</span>';
            document.getElementById('TienDi').innerHTML =
                "<span style='font-size: 25px;'>" +
                formatter.format(Money) +
                '</span>';
        }, 5000);
    });

    //Emit a username
    send_username.click(function () {
        socket.emit('change_username', { username: username.val() });
    });

    //Emit typing
    message.bind('keypress', () => {
        socket.emit('typing');
    });

    //Listen on typing
    socket.on('typing', (data) => {
        feedback.html(
            '<p><i>' + data.username + ' is typing a message...' + '</i></p>'
        );
    });
});

$('#closemessage').click(function () {
    if ($('.ChatBox').css('display') == 'none') {
        $('.ChatBox').css('display', 'block');
    } else {
        $('.ChatBox').css('display', 'none');
    }
});
$('.ChatBox').css('display', 'none');

function OpenHistoryRoute() {
    if (sessionStorage.getItem('userType') == 'Customer') {
        $.ajax({
            url: '/api/historyrouteuser/' + sessionStorage.getItem('LoginId'),
            type: 'GET',
        }).done(function (data) {
            console.log(data);
            var historyHTML = `
            <div class="container mb-5">
	            <div class="row" style="width: 40%;">
		            <div class="">
                        <ul class="timeline">
            `;
            data.forEach((element) => {
                historyHTML += `
                    <li>
                        <a target="_blank" href="#">${ShowMessageIfEmpty(
                            element.LogContent
                        )} VNĐ</a>
                        <a href="#" class="float-right">${ToDate(
                            element.CreatedDate
                        )}</a>
                        <p>${element.LogDescription}</p>
                    </li>
                `;
            });

            historyHTML += `</ul>
                            </div>
                        </div>
                    </div>`;
            document.getElementById('maphistoryroute').innerHTML = historyHTML;
        });
    } else if (sessionStorage.getItem('userType') == 'Driver') {
        $.ajax({
            url: '/api/historyroutedriver/' + sessionStorage.getItem('LoginId'),
            type: 'GET',
        }).done(function (data) {
            console.log(data);
            var historyHTML = `
            <div class="container mb-5">
	            <div class="row" style="width: 40%;">
		            <div class="">
                        <ul class="timeline">
            `;
            data.forEach((element) => {
                historyHTML += `
                    <li>
                        <a target="_blank" href="#">${ShowMessageIfEmpty(
                            element.LogContent
                        )} VNĐ</a>
                        <a href="#" class="float-right">${ToDate(
                            element.CreatedDate
                        )}</a>
                        <p>${element.LogDescription}</p>
                    </li>
                `;
            });

            historyHTML += `</ul>
                            </div>
                        </div>
                    </div>`;
            document.getElementById('maphistoryroute').innerHTML = historyHTML;
        });
    } else {
        PopupError('Bạn chưa đăng nhập vào hệ thống!');
    }
}

function OpenWallet() {
    $.ajax({
        url: '/api/getmoney/' + sessionStorage.getItem('LoginId'),
        type: 'GET',
    }).done(function (data) {
        document.getElementById('mapwallet').innerHTML =
            '<b>Số tiền trong tài khoản của bạn là:</b> ' +
            data[0].Money +
            ' VNĐ';
    });
}
document.getElementById('naptien-button').addEventListener('click', (e) => {
    const inputMoney = document.getElementById('inputMoney').value;
    console.log(inputMoney)
    if (inputMoney == '' || inputMoney == null) {
        PopupError('Bạn chưa nhập số tiền!');
    } else {
        $.ajax({
            url: '/api/naptien',
            type: 'POST',
            data: {
                money: inputMoney,
                userId: sessionStorage.getItem('LoginId'),
            },
            success: (data) => {},
        });

        PopupSuccess('Bạn nạp tiền thành công!');
        $.ajax({
            url: '/api/getmoney/' + sessionStorage.getItem('LoginId'),
            type: 'GET',
        }).done(function (data) {
            document.getElementById('mapwallet').innerHTML =
                '<b>Số tiền trong tài khoản của bạn là:</b> ' +
                data[0].Money +
                ' VNĐ';
            document.getElementById('moneyArea').innerHTML =
                data[0].money + ' VNĐ';
        });
    }
});
