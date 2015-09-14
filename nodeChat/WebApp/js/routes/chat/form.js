import $ from 'jquery';
import 'bootstrap';
import riot from 'riot';

riot.tag(
    'chat-form',
    '<div class="sendBox">' +
    '<div class="input-group">' +
    '<textarea class="form-control" rows="3" style="resize: none; height: 100px;"></textarea>' +
    '<span class="input-group-btn">' +
    '<button class="btn btn-default" type="button" onclick="{ onclick }" style="height: 100px;">Send</button>' +
    '</span>' +
    '</div>' +
    '</div>',
    function(opts) {
        this.onClick = function onClick() {
            //get data from input

            //ajax call to REST

            //handle response
        };
    }
);