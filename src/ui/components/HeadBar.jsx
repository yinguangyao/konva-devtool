import React, { useState, useEffect } from 'react';
import { CodeOutlined } from '@ant-design/icons';
import { Row, Select, Col, Button, Tooltip, Tag, Switch } from 'antd';

const HeadBar = (props) => {
  const {
    data,
    setSelectedHash,
    actions,
    selectedData,
    setData,
    selectedHash
  } = props;
  const [canvasAlive, setCanvasAlive] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const itv = setInterval(() => {
      actions.checkCanvasAlive(selectedHash).then((res) => {
        setCanvasAlive(res);
        if (res) {
          actions.getNowCanvasData().then((d) => {
            if (d) {
              setData(d);
            }
          });
        }
      });
    }, 1000);

    return () => {
      clearInterval(itv);
    };
  }, [actions, setData, selectedData, selectedHash]);

  useEffect(() => {
    const handler = (message) => {
      if (['closeHover', 'showShape'].includes(message.type)) {
        setChecked(false);
        actions.onSwitchPageListening(false);
      }
    };
    chrome.runtime.onMessage.addListener(handler);

    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [setChecked, actions]);

  useEffect(() => {
    if (!canvasAlive) {
      actions.getNowCanvasData().then((d) => {
        if (d) {
          setData(d);
          setSelectedHash(d[0].hash);
        }
      });
    }
  }, [actions, canvasAlive, setData, setSelectedHash]);

  const onSwitch = (checked) => {
    setChecked(checked);
    actions.onSwitchPageListening(checked);
  };

  return (
    <Row
      align="middle"
      style={{
        padding: 2,
        marginBottom: 6,
        borderBottom: '1px solid #ddd',
        background: 'rgba(0, 0, 0, 0.05)',
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 999
      }}
      gutter={[12, 12]}
    >
      <Col>
        <span style={{ margin: '0 6px' }}>Enable Mouseover: </span>
        <Switch checked={checked} onChange={onSwitch} />
      </Col>
      <Col>
        <Select
          bordered={false}
          size="small"
          defaultValue={0}
          options={data.map((e, i) => ({
            label: `Canvas ${i}`,
            value: e.hash,
            info: e
          }))}
          value={selectedHash}
          onChange={(val) => {
            setSelectedHash(val);
          }}
          placeholder="Choose a canvas to inspect"
          style={{ width: '100%' }}
        />
      </Col>
      {canvasAlive
        ? (
        <Col>
          <Tag color="green">ALIVE</Tag>
        </Col>
          )
        : (
        <Col>
          <Tag color="red">DEAD</Tag>
          <span>Trying to reconnect</span>
        </Col>
          )}
      {selectedData && <Col>{selectedData?.count} Shapes</Col>}
      <Col flex={1} />
      <Col>
        <Button
          size="small"
          type="text"
          onClick={() => {
            actions.consoleEl(selectedData.hash);
          }}
        >
          <Tooltip arrowPointAtCenter title="Console Canvas">
            <CodeOutlined />
          </Tooltip>
        </Button>
      </Col>
    </Row>
  );
};

export default HeadBar;
